// Waitlist form – submit to Kit via fetch, show inline success
const waitlistForm = document.getElementById('garden-waitlist-form');
const waitlistSuccess = document.getElementById('garden-waitlist-success');

if (waitlistForm) {
    let lastSubmit = 0;
    waitlistForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Rate limit – 1 submission per 10 seconds
        const now = Date.now();
        if (now - lastSubmit < 10000) {
            alert('Please wait a moment before trying again.');
            return;
        }
        lastSubmit = now;
        const email = waitlistForm.querySelector('input[type="email"]').value.trim();
        const name = waitlistForm.querySelector('input[name="fields[first_name]"]').value.trim();

        // Client-side validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        if (name.length < 1 || name.length > 100) {
            alert('Please enter your name.');
            return;
        }
        // Sanitize inputs
        const sanitize = (str) => {
            return str
                .replace(/<[^>]*>/g, '')        // Strip HTML tags
                .replace(/[<>"'`]/g, '')         // Remove chars used in XSS/injection
                .replace(/javascript:/gi, '')    // Block JS protocol
                .replace(/on\w+\s*=/gi, '')      // Block event handlers (onclick= etc)
                .replace(/\{\{.*?\}\}/g, '')     // Block template injection
                .trim();
        };

        const cleanName = sanitize(name);
        const cleanEmail = email.toLowerCase().trim();

        // Block obviously malicious patterns
        const dangerousPatterns = /(<script|javascript:|data:|vbscript:|on\w+=|union\s+select|drop\s+table|insert\s+into|eval\(|alert\()/i;
        if (dangerousPatterns.test(name + email)) {
            alert('Invalid input detected.');
            return;
        }

        waitlistForm.querySelector('input[type="email"]').value = cleanEmail;
        waitlistForm.querySelector('input[name="fields[first_name]"]').value = cleanName;

        const formData = new FormData(waitlistForm);
        const btn = waitlistForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Joining...';
        btn.disabled = true;

        try {
            await fetch(waitlistForm.action, {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            });
            waitlistForm.style.display = 'none';
            waitlistSuccess.style.display = 'block';
        } catch (err) {
            btn.innerHTML = originalText;
            btn.disabled = false;
            alert('Something went wrong. Please try again.');
        }
    });
}
