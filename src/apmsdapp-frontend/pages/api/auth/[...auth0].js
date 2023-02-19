import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

// to allow selection from different account 
// instead of directly login to one account
export default handleAuth({
    async login(req, res)
    {
        await handleLogin(req, res, {
            authorizationParams: {
                prompt: "login"
            }
        });
    }
});