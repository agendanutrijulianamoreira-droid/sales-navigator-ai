import { useState } from "react";
import { useImplementationChecklist } from "@/hooks/useImplementationChecklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, ChevronDown, ChevronRight, ArrowRight, Loader2, Map } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImplementationGPS() {
  const { completedTasks, loading, toggleTask, stats, phases } = useImplementationChecklist();
  const [expandedPhase, setExpandedPhase] = useState<number | null>(stats.currentPhase);

  if (loading) {
    return (
      <Card className="glass-card border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/50 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Map className="h-4 w-4 text-primary" />
            GPS de Implementação
          </CardTitle>
          <Badge variant="secondary" className="text-xs font-bold">
            {stats.completedCount}/{stats.totalTasks} tarefas
          </Badge>
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progresso geral</span>
            <span className="font-semibold">{stats.overallProgress}%</span>
          </div>
          <Progress value={stats.overallProgress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-2">
        {/* Phase Bars */}
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          {stats.phaseStats.map((ps, i) => (
            <button
              key={ps.fase}
              onClick={() => setExpandedPhase(expandedPhase === ps.fase ? null : ps.fase)}
              className={cn(
                "relative h-2 rounded-full transition-all overflow-hidden",
                ps.progress === 100 ? "bg-emerald-200" : ps.fase === stats.currentPhase ? "bg-primary/20" : "bg-muted"
              )}
            >
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all",
                  ps.progress === 100 ? "bg-emerald-500" : "bg-primary"
                )}
                style={{ width: `${ps.progress}%` }}
              />
            </button>
          ))}
        </div>

        {/* Phases */}
        {phases.map((phase) => {
          const ps = stats.phaseStats.find(p => p.fase === phase.fase)!;
          const isExpanded = expandedPhase === phase.fase;
          const isCurrent = stats.currentPhase === phase.fase;
          const isComplete = ps.progress === 100;

          return (
            <div key={phase.fase} className={cn(
              "rounded-xl border transition-all",
              isCurrent ? "border-primary/30 bg-primary/5" : isComplete ? "border-emerald-200 bg-emerald-50/30" : "border-border/50"
            )}>
              {/* Phase Header */}
              <button
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors rounded-xl"
                onClick={() => setExpandedPhase(isExpanded ? null : phase.fase)}
              >
                <span className="text-lg">{phase.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Fase {phase.fase}: {phase.title}</span>
                    {isComplete && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                    {isCurrent && !isComplete && <Badge className="text-[9px] py-0 h-4 bg-primary/20 text-primary border-none">Atual</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{phase.subtitle} — {ps.completed}/{ps.total}</p>
                </div>
                {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </button>

              {/* Tasks */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-1">
                  {phase.tasks.map((task) => {
                    const isDone = completedTasks.has(task.key);
                    return (
                      <div
                        key={task.key}
                        className={cn(
                          "flex items-start gap-2.5 p-2.5 rounded-lg transition-all group",
                          isDone ? "bg-emerald-50/50" : "hover:bg-muted/30"
                        )}
                      >
                        <button
                          onClick={() => toggleTask(task.key, phase.fase)}
                          className="mt-0.5 shrink-0"
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground/40 hover:text-primary transition-colors" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium", isDone && "line-through text-muted-foreground")}>{task.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                        </div>
                        {task.actionUrl && !isDone && (
                          <Link
                            to={task.actionUrl}
                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                              <ArrowRight className="h-3.5 w-3.5 text-primary" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
