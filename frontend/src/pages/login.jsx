import Signin from "../components/loginpages/signinCode";

function Login() {
    return (
        // 👇 Yahan dhyaan do: 'min-h-screen' screen ki height cover karega
        // aur 'bg-white' global black color ko over-ride kar dega.
        <div className="min-h-screen w-full bg-white text-black">
           <Signin />
        </div>
    );
}

export default Login;