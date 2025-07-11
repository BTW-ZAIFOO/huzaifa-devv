const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-gray-600">{message}</p>
  </div>
);

export default LoadingSpinner;
