export default function Toast({ message }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium pointer-events-none">
      {message}
    </div>
  );
}
