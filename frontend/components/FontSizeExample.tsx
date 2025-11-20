export default function FontSizeExample() {
  return (
    <div className="space-y-4 p-8">
      {/* Custom font sizes */}
      <h2 className="text-display font-semibold">Display Text (3rem)</h2>
      <h3 className="text-title font-medium">Title Text (2rem)</h3>
      <h4 className="text-subtitle">Subtitle Text (1.5rem)</h4>
      <p className="text-large">Large Text (1.25rem)</p>
      <p className="text-base">Base Text (default)</p>
      <p className="text-small">Small Text (0.875rem)</p>
      <p className="text-tiny">Tiny Text (0.75rem)</p>
      
      {/* Default Tailwind sizes still work */}
      <p className="text-xs">Extra Small (default Tailwind)</p>
      <p className="text-sm">Small (default Tailwind)</p>
      <p className="text-lg">Large (default Tailwind)</p>
      <p className="text-xl">Extra Large (default Tailwind)</p>

      <p className="text-display font-roboto">Column One (3rem)</p>
      <p className="text-display font-roboto font-bold">Profile (3rem)</p>
      <p className="text-title font-poppins font-bold">Grumpus (2rem)</p>
    </div>
  );
}

