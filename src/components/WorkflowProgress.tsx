import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

interface WorkflowStep {
  name: string;
  completed: boolean;
  optional: boolean;
}

interface WorkflowProgressProps {
  steps: WorkflowStep[];
  compact?: boolean;
}

export function WorkflowProgress({ steps, compact = false }: WorkflowProgressProps) {
  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {steps.map((step, index) => (
          <div key={step.name} className="flex items-center">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
              step.completed
                ? 'bg-green-500 text-white'
                : 'bg-slate-200 text-slate-500'
            }`}>
              {step.completed ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-current" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-1 ${
                steps[index + 1].completed ? 'bg-green-500' : 'bg-slate-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
      <CardHeader>
        <CardTitle className="text-slate-900">Workflow Progress</CardTitle>
        <CardDescription>Track the progress of your order through each stage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.name} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-current" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${
                    step.completed ? 'text-green-600' : 'text-slate-500'
                  }`}>
                    {step.optional && '['}
                    {step.name}
                    {step.optional && ']'}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  steps[index + 1].completed ? 'bg-green-500' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}