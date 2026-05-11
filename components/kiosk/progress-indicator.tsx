"use client";

interface ProgressIndicatorProps {
  currentStep: 1 | 2 | 3;
  steps: string[];
  description?: string;
}

export default function ProgressIndicator({
  currentStep,
  steps,
  description,
}: ProgressIndicatorProps) {
  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div className="flex items-center gap-6 justify-center w-full">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-24 h-24 rounded-full text-2xl font-bold transition-all ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/30"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`w-20 h-1 mx-4 transition-all ${
                    isCompleted ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center space-y-2">
        <p className="text-xl font-bold text-foreground">
          {steps[currentStep - 1]}
        </p>
        {description && (
          <p className="text-lg text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
