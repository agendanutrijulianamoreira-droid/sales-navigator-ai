import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useContentCalendarPosts } from "@/hooks/useContentCalendarPosts";
import { CalendarHeader } from "@/components/content-calendar/CalendarHeader";
import { CalendarToolbar, FilterState, ViewMode } from "@/components/content-calendar/CalendarToolbar";
import { MonthlyCalendar } from "@/components/content-calendar/MonthlyCalendar";
import { WeeklyCalendar } from "@/components/content-calendar/WeeklyCalendar";
import { FeedPreview } from "@/components/content-calendar/FeedPreview";
import { PostModal } from "@/components/content-calendar/PostModal";
import { ContentCalendarPost } from "@/types/contentCalendar";
import { nextStatus } from "@/lib/constants/contentCalendarStatus";

function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function ContentCalendar() {
  const navigate = useNavigate();
  const { posts, addPost, updatePost, deletePost, duplicatePost } = useContentCalendarPosts();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [view, setView] = useState<ViewMode>("mensal");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>({ status: [], format: [], platform: [] });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ContentCalendarPost | undefined>();
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = filters.status.length === 0 || filters.status.includes(p.status);
      const matchesFormat = filters.format.length === 0 || filters.format.includes(p.format);
      const matchesPlatform = filters.platform.length === 0 || filters.platform.includes(p.platform);
      return matchesSearch && matchesStatus && matchesFormat && matchesPlatform;
    });
  }, [posts, search, filters]);

  const monthPosts = useMemo(() => {
    return posts.filter((p) => {
      const d = new Date(p.scheduledDate + "T12:00:00");
      return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth();
    });
  }, [posts, currentDate]);

  const openNewPost = (date?: Date) => {
    setEditingPost(undefined);
    setDefaultDate(date || currentDate);
    setModalOpen(true);
  };

  const openEditPost = (post: ContentCalendarPost) => {
    setEditingPost(post);
    setDefaultDate(undefined);
    setModalOpen(true);
  };

  const handleSave = (draft: Parameters<typeof addPost>[0]) => {
    if (editingPost) {
      updatePost(editingPost.id, draft);
    } else {
      addPost(draft);
    }
  };

  const handleCycleStatus = (post: ContentCalendarPost) => {
    updatePost(post.id, { status: nextStatus(post.status) });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8FA]">
      <div className="flex items-center gap-2 px-5 pt-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B6B80] hover:text-[#1A1A2E] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </button>
      </div>

      <div className="px-5 pt-2 pb-1">
        <h1 className="text-[18px] font-semibold text-[#1A1A2E]">Calendário de Conteúdo</h1>
      </div>

      <div className="flex-1 flex flex-col mx-5 mb-5 rounded-xl border border-[#E8E8EC] overflow-hidden shadow-sm">
        <CalendarHeader
          currentDate={view === "semanal" ? weekStart : currentDate}
          monthPosts={monthPosts}
          onPrevMonth={() => {
            if (view === "semanal") {
              const d = new Date(weekStart);
              d.setDate(d.getDate() - 7);
              setWeekStart(d);
            } else {
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
            }
          }}
          onNextMonth={() => {
            if (view === "semanal") {
              const d = new Date(weekStart);
              d.setDate(d.getDate() + 7);
              setWeekStart(d);
            } else {
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
            }
          }}
        />

        <CalendarToolbar
          search={search}
          onSearchChange={setSearch}
          view={view}
          onViewChange={setView}
          filters={filters}
          onFiltersChange={setFilters}
          onNewPost={() => openNewPost()}
        />

        {view === "mensal" && (
          <MonthlyCalendar
            currentDate={currentDate}
            posts={filteredPosts}
            onDayClick={openNewPost}
            onPostClick={openEditPost}
            onCycleStatus={handleCycleStatus}
          />
        )}
        {view === "semanal" && (
          <WeeklyCalendar
            weekStart={weekStart}
            posts={filteredPosts}
            onPrevWeek={() => {
              const d = new Date(weekStart);
              d.setDate(d.getDate() - 7);
              setWeekStart(d);
            }}
            onNextWeek={() => {
              const d = new Date(weekStart);
              d.setDate(d.getDate() + 7);
              setWeekStart(d);
            }}
            onDayClick={openNewPost}
            onPostClick={openEditPost}
            onCycleStatus={handleCycleStatus}
          />
        )}
        {view === "feed" && <FeedPreview posts={filteredPosts} onPostClick={openEditPost} />}
      </div>

      <PostModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        post={editingPost}
        defaultDate={defaultDate}
        onSave={handleSave}
        onDelete={deletePost}
        onDuplicate={duplicatePost}
      />
    </div>
  );
}
