
async function testLogin() {
    const url = 'http://localhost:3000/users/login';
    const payload = {
        usuario: '  teste-espacos  ',
        senha: ' teste '
    };

    console.log('Sending payload:', JSON.stringify(payload));

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        console.log('Status:', response.status);
        const data = await response.json().catch(() => ({}));
        console.log('Response:', data);
    } catch (e) {
        console.error('Error:', e.message);
    }
}

testLogin();
