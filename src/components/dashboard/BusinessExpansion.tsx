const suggestions = [
  "Expand to new retail location",
  "Expand to new retail location",
  "Expand to new retail location",
  "Expand to new retail location",
  "Expand to new retail location",
  "Expand to new retail location",
];

const BusinessExpansion = () => {
  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
      <h3 className="text-base font-semibold text-card-foreground mb-4">
        Business Expansion<br />Suggestions
      </h3>
      
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="flex items-start gap-2 text-sm text-card-foreground"
          >
            <span className="text-muted-foreground">•</span>
            <span>{suggestion}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessExpansion;
