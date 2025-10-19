import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  type: "user" | "assistant";
  timestamp: Date;
}

interface Video {
  id: string;
  prompt: string;
  url: string;
  thumbnail: string;
  status: "generating" | "ready";
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Привет! Я помогу создать видео. Опиши, что хочешь увидеть 🎬",
      type: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      type: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsGenerating(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Начинаю генерацию видео: "${inputValue}"`,
        type: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      const newVideo: Video = {
        id: Date.now().toString(),
        prompt: inputValue,
        url: "",
        thumbnail: `https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=225&fit=crop`,
        status: "generating",
        timestamp: new Date(),
      };

      setVideos((prev) => [newVideo, ...prev]);
      setIsGenerating(false);

      setTimeout(() => {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === newVideo.id ? { ...v, status: "ready" } : v
          )
        );
        toast.success("Видео готово!");
      }, 3000);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-30" />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-vibrant bg-clip-text text-transparent">
            Veo Studio
          </h1>
          <p className="text-muted-foreground text-lg">
            Создавай видео силой слов с помощью Veo 3.1
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 backdrop-blur-sm bg-card/50 border-primary/20 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-gradient-purple animate-pulse-glow" />
              <h2 className="text-xl font-semibold">Чат генерации</h2>
            </div>

            <ScrollArea className="h-[400px] mb-4 pr-4">
              <div className="space-y-4">
                {messages.map((message, idx) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    } animate-fade-in`}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.type === "user"
                          ? "bg-gradient-purple text-white"
                          : "bg-muted/50 text-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <span className="text-xs opacity-60 mt-1 block">
                        {message.timestamp.toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Опиши видео, которое хочешь создать..."
                className="flex-1 bg-background/50 border-primary/30 focus:border-primary"
                disabled={isGenerating}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isGenerating || !inputValue.trim()}
                className="bg-gradient-purple hover:opacity-90 transition-opacity"
              >
                {isGenerating ? (
                  <Icon name="Loader2" className="animate-spin" size={20} />
                ) : (
                  <Icon name="Send" size={20} />
                )}
              </Button>
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-sm bg-card/50 border-secondary/20 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-gradient-vibrant animate-pulse-glow" />
              <h2 className="text-xl font-semibold">Галерея видео</h2>
              {videos.length > 0 && (
                <span className="ml-auto text-sm text-muted-foreground">
                  {videos.length} {videos.length === 1 ? "видео" : "видео"}
                </span>
              )}
            </div>

            <ScrollArea className="h-[500px]">
              {videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Icon name="Video" size={48} className="text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Здесь появятся твои видео
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pr-4">
                  {videos.map((video, idx) => (
                    <div
                      key={video.id}
                      className="group relative overflow-hidden rounded-lg border border-primary/20 bg-muted/20 hover:border-primary/40 transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={video.thumbnail}
                          alt={video.prompt}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {video.status === "generating" && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                            <div className="text-center">
                              <Icon
                                name="Loader2"
                                className="animate-spin mx-auto mb-2 text-primary"
                                size={32}
                              />
                              <p className="text-sm text-white">Генерация...</p>
                            </div>
                          </div>
                        )}
                        {video.status === "ready" && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all duration-300">
                            <Button
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 bg-white/90 hover:bg-white text-black"
                            >
                              <Icon name="Play" size={24} />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-foreground font-medium line-clamp-2">
                          {video.prompt}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {video.timestamp.toLocaleTimeString("ru-RU", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {video.status === "ready" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs h-7 gap-1"
                            >
                              <Icon name="Download" size={14} />
                              Скачать
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
