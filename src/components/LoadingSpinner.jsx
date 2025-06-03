// LoadingSpinner component displays a fullscreen loading overlay with a spinner and a message.
const LoadingSpinner = ({ message = "Loading..." }) => (

    // Overlay container: covers the entire viewport, centers its content, and uses a high z-index.
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">

        {/* Spinner: a circular animated element using Tailwind CSS classes */}
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>

        {/* Message: displays the loading message below the spinner */}
        <p className="text-gray-600">{message}</p>
    </div>
);

export default LoadingSpinner;
