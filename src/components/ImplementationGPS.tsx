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
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleTaskExpansion = (taskKey: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskKey)) next.delete(taskKey);
      else next.add(taskKey);
      return next;
    });
  };

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
            GPS do Consultório
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
                    const isTaskExpanded = expandedTasks.has(task.key);
                    
                    return (
                      <div
                        key={task.key}
                        className={cn(
                          "flex flex-col gap-1 rounded-lg transition-all border border-transparent",
                          isDone ? "bg-emerald-50/50" : isTaskExpanded ? "bg-muted/50 border-border/50" : "hover:bg-muted/30"
                        )}
                      >
                        <div className="flex items-start gap-2.5 p-2.5 group">
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
                          
                          <div 
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => toggleTaskExpansion(task.key)}
                          >
                            <div className="flex items-center gap-2">
                              <p className={cn("text-sm font-medium", isDone && "line-through text-muted-foreground")}>{task.label}</p>
                              {task.steps && task.steps.length > 0 && (
                                <div className="p-0.5 rounded-full hover:bg-muted transition-colors">
                                  {isTaskExpanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{task.description}</p>
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

                        {/* Expandable Steps */}
                        {isTaskExpanded && task.steps && task.steps.length > 0 && (
                          <div className="px-10 pb-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="h-px bg-border/20 mb-2" />
                            {task.steps.map((step, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <div className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                                <span className="text-[11px] text-muted-foreground leading-relaxed">{step}</span>
                              </div>
                            ))}
                          </div>
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
