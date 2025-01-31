import React from "react";

const TestPage = () => {
  return (
    <main>
      <div className="relative w-screen h-[2000px]">
        {/* Background layer with blur */}
        <div className="absolute inset-0 bg-test bg-yellow-50 blur-md brightness-110 bg-cover"></div>

        {/* Foreground content */}
        <div className="relative z-10 max-w-[1440px] mx-auto w-full h-screen pt-24">
        </div>
      </div>
    </main>
  );
};

export default TestPage;
