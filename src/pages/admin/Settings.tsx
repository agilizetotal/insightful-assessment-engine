
import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Save, 
  RotateCw, 
  Mail, 
  CreditCard, 
  Palette, 
  Globe, 
  Code, 
  FileCode
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [settings, setSettings] = useState({
    appearance: {
      theme: "system",
      primaryColor: "#4F46E5",
      fontSize: "normal",
      borderRadius: "medium",
      customCss: ""
    },
    email: {
      smtpHost: "",
      smtpPort: "",
      smtpUser: "",
      smtpPassword: "",
      fromEmail: "",
      emailTemplate: ""
    },
    integration: {
      webhookUrl: "",
      apiKey: "",
      enableWordPress: false,
      enableN8n: false,
      stripePublicKey: "",
      stripePrivateKey: ""
    },
    general: {
      siteName: "Insightful Assessment Engine",
      defaultLanguage: "en",
      allowGuestResponses: true,
      requireEmailForResults: false,
      autoSendResults: false
    }
  });
  
  const handleSaveSettings = (tab: string) => {
    setIsSubmitting(true);
    
    // Simulate saving settings
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Settings Saved",
        description: `Your ${tab} settings have been updated successfully.`
      });
    }, 1000);
  };
  
  const updateSetting = (category: keyof typeof settings, field: string, value: any) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [field]: value
      }
    });
  };
  
  const testEmailConnection = () => {
    toast({
      title: "Testing Connection",
      description: "Attempting to connect to SMTP server..."
    });
    
    setTimeout(() => {
      toast({
        title: "Connection Successful",
        description: "Successfully connected to the SMTP server."
      });
    }, 1500);
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500">Configure your assessment engine</p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="integration">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic settings for your assessment engine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input 
                  id="siteName" 
                  value={settings.general.siteName}
                  onChange={e => updateSetting('general', 'siteName', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <Select 
                  value={settings.general.defaultLanguage}
                  onValueChange={value => updateSetting('general', 'defaultLanguage', value)}
                >
                  <SelectTrigger id="defaultLanguage">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label 
                      htmlFor="allowGuestResponses" 
                      className="font-medium"
                    >
                      Allow Guest Responses
                    </Label>
                    <p className="text-sm text-gray-500">
                      Let users take quizzes without creating an account
                    </p>
                  </div>
                  <Switch 
                    id="allowGuestResponses" 
                    checked={settings.general.allowGuestResponses}
                    onCheckedChange={checked => 
                      updateSetting('general', 'allowGuestResponses', checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label 
                      htmlFor="requireEmailForResults" 
                      className="font-medium"
                    >
                      Require Email for Results
                    </Label>
                    <p className="text-sm text-gray-500">
                      Users must provide an email to view their results
                    </p>
                  </div>
                  <Switch 
                    id="requireEmailForResults" 
                    checked={settings.general.requireEmailForResults}
                    onCheckedChange={checked => 
                      updateSetting('general', 'requireEmailForResults', checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label 
                      htmlFor="autoSendResults" 
                      className="font-medium"
                    >
                      Auto-Send Results
                    </Label>
                    <p className="text-sm text-gray-500">
                      Automatically email results to users after completion
                    </p>
                  </div>
                  <Switch 
                    id="autoSendResults" 
                    checked={settings.general.autoSendResults}
                    onCheckedChange={checked => 
                      updateSetting('general', 'autoSendResults', checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSaveSettings('general')}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your assessment engine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select 
                  value={settings.appearance.theme}
                  onValueChange={value => updateSetting('appearance', 'theme', value)}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="primaryColor" 
                    type="color"
                    className="w-12 p-1 h-10"
                    value={settings.appearance.primaryColor}
                    onChange={e => updateSetting('appearance', 'primaryColor', e.target.value)}
                  />
                  <Input 
                    type="text"
                    value={settings.appearance.primaryColor}
                    onChange={e => updateSetting('appearance', 'primaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select 
                    value={settings.appearance.fontSize}
                    onValueChange={value => updateSetting('appearance', 'fontSize', value)}
                  >
                    <SelectTrigger id="fontSize">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="borderRadius">Border Radius</Label>
                  <Select 
                    value={settings.appearance.borderRadius}
                    onValueChange={value => updateSetting('appearance', 'borderRadius', value)}
                  >
                    <SelectTrigger id="borderRadius">
                      <SelectValue placeholder="Select radius" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="customCss">
                  <AccordionTrigger>Advanced Customization</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <Label htmlFor="customCss">Custom CSS</Label>
                      <Textarea 
                        id="customCss" 
                        placeholder="Add your custom CSS here"
                        className="font-mono text-sm"
                        rows={8}
                        value={settings.appearance.customCss}
                        onChange={e => updateSetting('appearance', 'customCss', e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        Use custom CSS to further customize the appearance of your assessment engine.
                        These styles will be applied globally.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSaveSettings('appearance')}
                disabled={isSubmitting}
                className="bg-[#4F46E5] hover:bg-[#4338CA]"
                style={{ backgroundColor: settings.appearance.primaryColor }}
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Palette className="h-4 w-4 mr-2" />
                    Save Appearance
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure email delivery for assessment results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input 
                    id="smtpHost" 
                    placeholder="e.g., smtp.gmail.com"
                    value={settings.email.smtpHost}
                    onChange={e => updateSetting('email', 'smtpHost', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input 
                    id="smtpPort" 
                    placeholder="e.g., 587"
                    value={settings.email.smtpPort}
                    onChange={e => updateSetting('email', 'smtpPort', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input 
                    id="smtpUser" 
                    placeholder="Your SMTP username"
                    value={settings.email.smtpUser}
                    onChange={e => updateSetting('email', 'smtpUser', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input 
                    id="smtpPassword" 
                    type="password"
                    placeholder="Your SMTP password"
                    value={settings.email.smtpPassword}
                    onChange={e => updateSetting('email', 'smtpPassword', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input 
                  id="fromEmail" 
                  placeholder="noreply@yourdomain.com"
                  value={settings.email.fromEmail}
                  onChange={e => updateSetting('email', 'fromEmail', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailTemplate">Email Template</Label>
                <Textarea 
                  id="emailTemplate" 
                  placeholder="HTML template for result emails"
                  rows={6}
                  value={settings.email.emailTemplate}
                  onChange={e => updateSetting('email', 'emailTemplate', e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Use variables like {'{name}'}, {'{score}'}, {'{profile}'} which will be replaced with actual values.
                </p>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={testEmailConnection}
                  className="mr-2"
                >
                  Test Connection
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSaveSettings('email')}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Save Email Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>
                Connect with third-party services and payment processors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Payment Integration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                    <Input 
                      id="stripePublicKey" 
                      placeholder="pk_test_..."
                      value={settings.integration.stripePublicKey}
                      onChange={e => updateSetting('integration', 'stripePublicKey', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stripePrivateKey">Stripe Private Key</Label>
                    <Input 
                      id="stripePrivateKey" 
                      type="password"
                      placeholder="sk_test_..."
                      value={settings.integration.stripePrivateKey}
                      onChange={e => updateSetting('integration', 'stripePrivateKey', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-4">
                <h3 className="font-medium">External Integrations</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label 
                      htmlFor="enableWordPress" 
                      className="font-medium"
                    >
                      WordPress Integration
                    </Label>
                    <p className="text-sm text-gray-500">
                      Connect with WordPress sites via REST API
                    </p>
                  </div>
                  <Switch 
                    id="enableWordPress" 
                    checked={settings.integration.enableWordPress}
                    onCheckedChange={checked => 
                      updateSetting('integration', 'enableWordPress', checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label 
                      htmlFor="enableN8n" 
                      className="font-medium"
                    >
                      n8n Integration
                    </Label>
                    <p className="text-sm text-gray-500">
                      Connect with n8n for workflow automation
                    </p>
                  </div>
                  <Switch 
                    id="enableN8n" 
                    checked={settings.integration.enableN8n}
                    onCheckedChange={checked => 
                      updateSetting('integration', 'enableN8n', checked)
                    }
                  />
                </div>
              </div>
              
              <div className="space-y-2 pt-4">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input 
                  id="webhookUrl" 
                  placeholder="https://your-webhook-url.com/endpoint"
                  value={settings.integration.webhookUrl}
                  onChange={e => updateSetting('integration', 'webhookUrl', e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Send quiz results to this webhook endpoint
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="apiKey" 
                    placeholder="Your API key will appear here"
                    readOnly
                    value={settings.integration.apiKey || "••••••••••••••••••••••••••••••"}
                    className="flex-1"
                  />
                  <Button variant="outline">
                    Generate New Key
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Use this key to authenticate API requests from external services
                </p>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="apiDocs">
                  <AccordionTrigger>API Documentation</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 text-sm">
                      <p>
                        The assessment engine provides a RESTful API for integration with other systems.
                        Below are some example endpoints:
                      </p>
                      
                      <div className="bg-gray-50 p-3 rounded-md font-mono text-xs overflow-x-auto">
                        <p>GET /api/quizzes - List all quizzes</p>
                        <p>GET /api/quizzes/:id - Get a specific quiz</p>
                        <p>POST /api/responses - Submit a quiz response</p>
                        <p>GET /api/results/:id - Get quiz results</p>
                      </div>
                      
                      <p>
                        All requests must include the API key in the Authorization header:
                      </p>
                      
                      <div className="bg-gray-50 p-3 rounded-md font-mono text-xs overflow-x-auto">
                        Authorization: Bearer YOUR_API_KEY
                      </div>
                      
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-quiz-primary"
                      >
                        <FileCode className="h-4 w-4 mr-2" />
                        View full API documentation
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <Button 
                onClick={() => handleSaveSettings('integration')}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Save Integration Settings
                  </>
                )}
              </Button>
              
              <Button variant="outline">
                <Code className="h-4 w-4 mr-2" />
                Test Webhook
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
