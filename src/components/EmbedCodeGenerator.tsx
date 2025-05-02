
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Check, Copy, Link } from "lucide-react";
import { translations } from "@/locales/pt-BR";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

interface EmbedCodeGeneratorProps {
  quizId: string;
}

export function EmbedCodeGenerator({ quizId }: EmbedCodeGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const hostUrl = window.location.origin;
  
  // Direct shareable link
  const shareableLink = `${hostUrl}/quiz/${quizId}`;
  
  // Embed code optimized for WordPress
  const embedCode = `
<div id="quiz-container-${quizId}" style="width:100%;max-width:800px;margin:0 auto;"></div>
<script>
  (function() {
    var container = document.getElementById('quiz-container-${quizId}');
    var iframe = document.createElement('iframe');
    // Use embed URL to hide navigation and optimize for embedding
    iframe.src = '${hostUrl}/quiz/${quizId}?embed=true';
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    container.appendChild(iframe);
    
    // Add responsive resizing
    window.addEventListener('message', function(event) {
      if (event.origin !== '${hostUrl}') return;
      if (event.data && event.data.type === 'quiz-height') {
        iframe.style.height = (event.data.height + 20) + 'px';
      }
    }, false);
  })();
</script>
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success("Código copiado com sucesso!");
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopiedLink(true);
    toast.success("Link copiado com sucesso!");
    
    setTimeout(() => {
      setCopiedLink(false);
    }, 2000);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Compartilhar questionário</CardTitle>
        <CardDescription>Compartilhe seu questionário com outras pessoas ou incorpore em seu site</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="embed">
          <TabsList className="mb-4">
            <TabsTrigger value="embed">Código de incorporação</TabsTrigger>
            <TabsTrigger value="link">Link compartilhável</TabsTrigger>
          </TabsList>
          
          <TabsContent value="embed">
            <div className="space-y-4">
              <Textarea 
                value={embedCode}
                className="font-mono text-sm h-40"
                readOnly
              />
              <Button 
                onClick={handleCopy} 
                className="mt-4" 
                variant={copied ? "outline" : "default"}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar código
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="link">
            <div className="space-y-4">
              <div className="flex flex-col">
                <p className="text-sm text-muted-foreground mb-2">
                  Compartilhe este link para permitir que outras pessoas acessem seu questionário.
                  Cada pessoa terá suas próprias respostas registradas separadamente.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Input value={shareableLink} readOnly className="font-mono flex-1" />
                  <Button 
                    onClick={handleCopyLink} 
                    variant={copiedLink ? "outline" : "default"}
                    size="sm"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Adding missing Input component import
import { Input } from "./ui/input";
