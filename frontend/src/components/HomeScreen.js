import React from 'react';

export default function HomeScreen() {
  return (
    <div>
      {/* Video nền (nếu cần) */}
      {/* <video width="600" controls>
        <source src="/frontend/public/3145-166335957_small.mp4" type="video/mp4" />
      </video> */}

      {/* Tiêu đề */}
      <div className="row center">
        <h1>Welcome to Online Learning</h1>
      </div>

      {/* Hình ảnh */}
      <div className="row center">
        <img 
          src="/frontend/public/logo512.png"
          alt="Online Learning" 
          width="600"
        />
      </div>
    </div>
  );
}
