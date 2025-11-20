import React from "react";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

function App() {
  return (
    <div>
      <NavBar />
      {/* updated content: use lowercase <p> and clearer layout */}
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome to SmartAttendanceSystem</h1>
          <p className="text-gray-600">System is under development.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;