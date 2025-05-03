
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

interface EmbedCodeGeneratorProps {
  quizId: string;
}

export function EmbedCodeGenerator({ quizId }: EmbedCodeGeneratorProps) {
  const [siteUrl, setSiteUrl] = useState('');
  const [height, setHeight] = useState('700');
  const [embedCode, setEmbedCode] = useState('');
  const [shareableLink, setShareableLink] = useState('');
  
  useEffect(() => {
    // Generate base URL from window location
    const baseUrl = window.location.origin;
    const quizUrl = `${baseUrl}/quiz/${quizId}?embed=true`;
    setShareableLink(`${baseUrl}/quiz/${quizId}`);
    
    // Generate responsive iframe code optimized for WordPress
    const code = `<!-- Quiz Embed Code - Start -->
<div class="quiz-container" style="width: 100%; position: relative;">
  <iframe 
    src="${quizUrl}" 
    frameborder="0" 
    style="width: 100%; min-height: ${height}px; border: none; overflow: hidden;" 
    scrolling="no"
    allow="fullscreen"
    title="Questionário Interativo"
    id="quiz-iframe-${quizId}"
  ></iframe>
</div>
<script>
  // Make iframe responsive
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'quiz-height') {
      var iframe = document.getElementById('quiz-iframe-${quizId}');
      if (iframe) {
        iframe.style.height = (e.data.height + 20) + 'px';
      }
    }
  }, false);
</script>
<!-- Quiz Embed Code - End -->`;

    setEmbedCode(code);
  }, [quizId, height, siteUrl]);

  const handleCopyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    toast.success("Código copiado para a área de transferência!");
  };

  const handleCopyShareableLink = () => {
    navigator.clipboard.writeText(shareableLink);
    toast.success("Link copiado para a área de transferência!");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Incorporar Questionário</CardTitle>
        <CardDescription>
          Gere um código para incorporar este questionário em seu site WordPress ou qualquer outro site.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="height">Altura do iframe (pixels)</Label>
          <Input
            id="height"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="700"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="embed-code">Código para Incorporação</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyEmbedCode}
              className="h-8 gap-1"
            >
              <CopyIcon className="h-3.5 w-3.5" />
              <span>Copiar</span>
            </Button>
          </div>
          <Textarea
            id="embed-code"
            readOnly
            value={embedCode}
            className="font-mono text-xs h-40"
          />
          <p className="text-xs text-muted-foreground">
            Este código criará um iframe responsivo que se ajusta à altura do conteúdo
            e é otimizado para WordPress.
          </p>
        </div>
        
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Label htmlFor="shareable-link">Link Compartilhável</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyShareableLink}
              className="h-8 gap-1"
            >
              <CopyIcon className="h-3.5 w-3.5" />
              <span>Copiar</span>
            </Button>
          </div>
          <Input
            id="shareable-link"
            readOnly
            value={shareableLink}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Este link pode ser compartilhado diretamente com seus usuários. 
            Cada pessoa que responder terá suas respostas salvas separadamente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
