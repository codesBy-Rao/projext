const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="py-6 px-8 bg-gray-800 shadow-md">
        <h1 className="text-3xl font-bold text-gradient gradient-accent">
          🐞 CodeBugX
        </h1>
      </header>
      <main className="flex flex-col items-center justify-center py-20">
        <h2 className="text-5xl font-extrabold mb-6 text-center">
          Debug Smarter, Code Faster
        </h2>
        <p className="text-lg text-gray-300 text-center max-w-2xl">
          CodeBugX is your ultimate debugging companion. Analyze, debug, and optimize your code with ease.
        </p>
        <div className="mt-8">
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl">
            Get Started
          </button>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;