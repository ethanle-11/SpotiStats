function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0D0C]">
            <div className="flex flex-col items-center">
                <h1 className="text-white text-8xl font-bold mb-3">
                    SpotiStats
                </h1>

                <p className="text-white text-s mb-16">
                    All your Spotify analytics in one place
                </p>

                <a
                    href="http://127.0.0.1:3001/auth/login"
                    className="block w-64 rounded-full bg-[#1DB954] px-6 py-3 text-center font-semibold text-black transition hover:bg-[#1ED760] hover:scale-[1.02]"
                >
                    Login with Spotify
                </a>
            </div>
        </div>
    )
}

export default Login