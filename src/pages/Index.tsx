import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

interface Video {
  id: string;
  prompt: string;
  status: "queue" | "generating" | "ready" | "error";
  url?: string;
  thumbnail: string;
  timestamp: Date;
  progress: number;
}

const Index = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [videos]);

  const generateThumbnail = () => {
    const thumbnails = [
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1",
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    ];
    return thumbnails[Math.floor(Math.random() * thumbnails.length)] + "?w=600&h=400&fit=crop";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const promptText = inputValue.trim();
    setInputValue("");
    setIsProcessing(true);

    const newVideo: Video = {
      id: `video_${Date.now()}`,
      prompt: promptText,
      status: "queue",
      thumbnail: generateThumbnail(),
      timestamp: new Date(),
      progress: 0,
    };

    setVideos((prev) => [newVideo, ...prev]);

    try {
      setTimeout(() => {
        setVideos((prev) =>
          prev.map((v) => (v.id === newVideo.id ? { ...v, status: "generating", progress: 10 } : v))
        );
      }, 500);

      const response = await fetch(
        "https://functions.poehali.dev/b5daeb74-1fcd-4fe1-b86e-5719dcab55ab",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: promptText }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        let progress = 20;
        const progressInterval = setInterval(() => {
          progress += Math.random() * 15;
          if (progress > 90) progress = 90;

          setVideos((prev) =>
            prev.map((v) => (v.id === newVideo.id ? { ...v, progress } : v))
          );
        }, 800);

        setTimeout(() => {
          clearInterval(progressInterval);
          setVideos((prev) =>
            prev.map((v) =>
              v.id === newVideo.id
                ? { ...v, status: "ready", progress: 100, url: v.thumbnail }
                : v
            )
          );
          toast.success("Видео готово! 🎬");
        }, 6000);
      } else {
        throw new Error(data.error || "Ошибка генерации");
      }
    } catch (error) {
      setVideos((prev) =>
        prev.map((v) =>
          v.id === newVideo.id ? { ...v, status: "error", progress: 0 } : v
        )
      );
      toast.error(`Ошибка: ${error instanceof Error ? error.message : "Не удалось создать видео"}`);
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusBadge = (status: Video["status"]) => {
    switch (status) {
      case "queue":
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">В очереди</Badge>;
      case "generating":
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 animate-pulse">Генерация</Badge>;
      case "ready":
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Готово</Badge>;
      case "error":
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Ошибка</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-vibrant rounded-xl flex items-center justify-center">
              <Icon name="Video" className="text-white" size={28} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-vibrant bg-clip-text text-transparent">
              Veo 3.1 Studio
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Опиши видео — получи результат. Бесконечные генерации 🎬
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden animate-slide-up">
          <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Опиши видео: закат над океаном, космический корабль, танцующий робот..."
                className="flex-1 bg-background/80 border-border/50 text-base h-12"
                disabled={isProcessing}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isProcessing}
                size="lg"
                className="bg-gradient-vibrant hover:opacity-90 transition-opacity px-8 h-12"
              >
                <Icon name="Sparkles" size={20} className="mr-2" />
                Создать
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[600px]" ref={scrollRef}>
            <div className="p-6">
              {videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[500px] text-center">
                  <div className="w-20 h-20 bg-gradient-vibrant rounded-full flex items-center justify-center mb-6 animate-pulse-glow">
                    <Icon name="Video" size={40} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Начни создавать видео</h3>
                  <p className="text-muted-foreground max-w-md">
                    Введи описание выше и нажми "Создать". Все видео появятся здесь.
                    Можешь генерировать бесконечно! 🚀
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos.map((video, index) => (
                    <Card
                      key={video.id}
                      className="group overflow-hidden border-border/50 bg-card/30 hover:bg-card/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                      style={{
                        animation: `fade-in 0.5s ease-out ${index * 0.1}s both`,
                      }}
                    >
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        <img
                          src={video.thumbnail}
                          alt={video.prompt}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {video.status === "generating" && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                            <div className="w-16 h-16 mb-4">
                              <svg className="animate-spin" viewBox="0 0 24 24">
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                            </div>
                            <div className="w-48 bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-vibrant h-full transition-all duration-500"
                                style={{ width: `${video.progress}%` }}
                              />
                            </div>
                            <p className="text-white text-sm mt-2">{Math.round(video.progress)}%</p>
                          </div>
                        )}
                        {video.status === "ready" && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button size="lg" className="bg-white text-black hover:bg-white/90">
                              <Icon name="Play" size={24} className="mr-2" />
                              Смотреть
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p className="text-sm text-foreground/90 line-clamp-2 flex-1">
                            {video.prompt}
                          </p>
                          {getStatusBadge(video.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {video.timestamp.toLocaleTimeString("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Сгенерировано видео: <span className="font-semibold text-primary">{videos.length}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
