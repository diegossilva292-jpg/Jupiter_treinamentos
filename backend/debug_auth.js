
async function runTests() {
    const url = 'https://api.jupiter.com.br/action/Usuario/logar';
    const payload = {
        usuario: 'teste', // Intentionally invalid user to check response format
        senha: 'teste'
    };

    console.log('--- TEST 1: Sending JSON ---');
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
        console.log('Headers:', Object.fromEntries(response.headers));
        const text = await response.text();
        console.log('Body:', text.substring(0, 500)); // Show beginning of body
    } catch (e) {
        console.error('Error (JSON):', e.message);
    }

    console.log('\n--- TEST 2: Sending Form Data (x-www-form-urlencoded) ---');
    try {
        const params = new URLSearchParams();
        params.append('usuario', payload.usuario);
        params.append('senha', payload.senha);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                // Many older APIs don't respect Accept: application/json properly, but let's see.
            },
            body: params.toString(),
        });
        console.log('Status:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers));
        const text = await response.text();
        console.log('Body:', text.substring(0, 500));
    } catch (e) {
        console.error('Error (Form Data):', e.message);
    }
}

runTests();
