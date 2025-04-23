
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { 
  CreditCard, 
  Lock, 
  ArrowLeft, 
  CheckCircle, 
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
    name: "",
    email: ""
  });
  
  const handleInputChange = (field: string, value: string) => {
    setPaymentInfo({
      ...paymentInfo,
      [field]: value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully. Redirecting to your results..."
      });
      
      // Redirect to results page after payment
      setTimeout(() => {
        navigate("/quiz/results?premium=true");
      }, 1500);
    }, 2000);
  };
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Premium Assessment Report</CardTitle>
            <CardDescription>
              Unlock your complete assessment results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span>Premium Report</span>
              <span className="font-medium">$29.99</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tax</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2">
              <span>Total</span>
              <span>$29.99</span>
            </div>
            
            <div className="pt-4 space-y-2">
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <span>Detailed analysis of your leadership profile</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <span>Personalized development recommendations</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <span>Comprehensive PDF report to download</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <span>Email delivery of your complete report</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>
              Your payment will be processed securely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Your email address"
                  value={paymentInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Name on Card</Label>
                <Input 
                  id="name" 
                  placeholder="Name as it appears on card"
                  value={paymentInfo.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <Input 
                    id="cardNumber" 
                    placeholder="1234 5678 9012 3456"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                    required
                  />
                  <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiration Date</Label>
                  <Input 
                    id="expiry" 
                    placeholder="MM/YY"
                    value={paymentInfo.expiry}
                    onChange={(e) => handleInputChange("expiry", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input 
                    id="cvc" 
                    placeholder="123"
                    value={paymentInfo.cvc}
                    onChange={(e) => handleInputChange("cvc", e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center text-xs text-gray-500 pt-2">
                <Lock className="h-3 w-3 mr-1" />
                <span>Your payment information is encrypted and secure</span>
              </div>
              
              <Button 
                type="submit" 
                className="w-full mt-4 bg-quiz-primary hover:bg-quiz-secondary"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Pay Securely Now
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-xs text-gray-500 flex justify-center">
            <div className="flex items-center">
              <Lock className="h-3 w-3 mr-1" />
              <span>
                Secure payment processing. Your card details will not be stored.
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
