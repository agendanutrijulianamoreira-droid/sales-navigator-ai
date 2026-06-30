import { ContentCalendarPost } from "@/types/contentCalendar";
import { STATUS_CONFIG } from "@/lib/constants/contentCalendarStatus";
import { FORMAT_CONFIG } from "@/lib/constants/contentCalendarFormat";

interface FeedPreviewProps {
  posts: ContentCalendarPost[];
  onPostClick: (post: ContentCalendarPost) => void;
}

export function FeedPreview({ posts, onPostClick }: FeedPreviewProps) {
  const instagramPosts = posts
    .filter((p) => p.platform === "instagram")
    .sort((a, b) => (b.scheduledDate + (b.scheduledTime || "")).localeCompare(a.scheduledDate + (a.scheduledTime || "")));

  if (instagramPosts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-[#6B6B80]">
        Nenhum post do Instagram para mostrar no feed.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white p-1">
      <div className="grid grid-cols-3 gap-1 max-w-3xl mx-auto">
        {instagramPosts.map((post) => {
          const statusCfg = STATUS_CONFIG[post.status];
          const FormatIcon = FORMAT_CONFIG[post.format].icon;
          return (
            <div
              key={post.id}
              onClick={() => onPostClick(post)}
              className="relative aspect-square cursor-pointer group overflow-hidden bg-[#F5F5F5]"
            >
              {post.thumbnailUrl ? (
                <img src={post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: statusCfg.bgLight }}
                >
                  <FormatIcon className="h-8 w-8" style={{ color: statusCfg.hex }} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/55 transition-colors flex flex-col items-center justify-center text-center p-2 opacity-0 group-hover:opacity-100">
                <p className="text-white text-xs font-semibold line-clamp-2">{post.title || "Sem título"}</p>
                <p className="text-white/80 text-[10px] mt-1">{statusCfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
