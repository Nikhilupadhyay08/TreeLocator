import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Check, X, Loader2, Mail, CheckCircle } from "lucide-react";
import { customFetch } from "@/api/custom-fetch";

interface SmtpConfig {
  id: number;
  name: string;
  provider: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SmtpManagement() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<SmtpConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTestingOpen, setIsTestingOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<SmtpConfig | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    provider: "gmail",
    host: "",
    port: "587",
    secure: false,
    username: "",
    password: "",
    fromEmail: "",
    fromName: "Tree Tracking System",
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setIsLoading(true);
      const response = await customFetch("/admin/smtp", { method: "GET" });
      const data = await response.json();
      setConfigs(data.configs);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to fetch SMTP configurations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (config?: SmtpConfig) => {
    if (config) {
      setSelectedConfig(config);
      setFormData({
        name: config.name,
        provider: config.provider,
        host: config.host,
        port: config.port.toString(),
        secure: config.secure,
        username: config.username,
        password: "",
        fromEmail: config.fromEmail,
        fromName: config.fromName,
      });
    } else {
      setSelectedConfig(null);
      setFormData({
        name: "",
        provider: "gmail",
        host: "",
        port: "587",
        secure: false,
        username: "",
        password: "",
        fromEmail: "",
        fromName: "Tree Tracking System",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveConfig = async () => {
    try {
      if (!formData.name || !formData.host || !formData.username || !formData.password || !formData.fromEmail) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const url = selectedConfig ? `/admin/smtp/${selectedConfig.id}` : "/admin/smtp";
      const method = selectedConfig ? "PUT" : "POST";

      const response = await customFetch(url, {
        method,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save SMTP configuration");
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: selectedConfig 
          ? "SMTP configuration updated successfully" 
          : "SMTP configuration created successfully",
      });

      setIsDialogOpen(false);
      fetchConfigs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to save SMTP configuration",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfig = async (id: number) => {
    try {
      const response = await customFetch(`/admin/smtp/${id}`, { method: "DELETE" });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete SMTP configuration");
      }

      toast({
        title: "Success",
        description: "SMTP configuration deleted successfully",
      });

      fetchConfigs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete SMTP configuration",
        variant: "destructive",
      });
    }
  };

  const handleActivateConfig = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await customFetch(`/admin/smtp/${id}/activate`, { method: "POST" });

      if (!response.ok) {
        throw new Error("Failed to activate SMTP configuration");
      }

      toast({
        title: "Success",
        description: "SMTP configuration activated successfully",
      });

      fetchConfigs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to activate SMTP configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyConnection = async (config: SmtpConfig) => {
    try {
      setIsVerifying(true);
      const response = await customFetch(`/admin/smtp/${config.id}/verify`, { method: "POST" });

      if (!response.ok) {
        throw new Error("SMTP connection verification failed");
      }

      toast({
        title: "Success",
        description: "SMTP connection verified successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to verify SMTP connection",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSendTestEmail = async (configId: number) => {
    try {
      if (!testEmail) {
        toast({
          title: "Error",
          description: "Please enter a test email address",
          variant: "destructive",
        });
        return;
      }

      setIsTesting(true);
      const response = await customFetch(`/admin/smtp/${configId}/test`, {
        method: "POST",
        body: JSON.stringify({ testEmail }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send test email");
      }

      toast({
        title: "Success",
        description: "Test email sent successfully",
      });

      setIsTestingOpen(false);
      setTestEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SMTP Configuration</h2>
          <p className="text-muted-foreground mt-1">Manage email configurations for sending OTPs and notifications</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add SMTP Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedConfig ? "Edit SMTP Configuration" : "Add SMTP Configuration"}
              </DialogTitle>
              <DialogDescription>
                {selectedConfig ? "Update the SMTP configuration details" : "Configure a new SMTP server"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Configuration Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Gmail, Outlook, Custom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select value={formData.provider} onValueChange={(value) => setFormData({ ...formData, provider: value })}>
                  <SelectTrigger id="provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gmail">Gmail</SelectItem>
                    <SelectItem value="outlook">Outlook</SelectItem>
                    <SelectItem value="custom">Custom SMTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">SMTP Host *</Label>
                  <Input
                    id="host"
                    placeholder="e.g., smtp.gmail.com"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port *</Label>
                  <Input
                    id="port"
                    placeholder="587"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="secure"
                  checked={formData.secure}
                  onCheckedChange={(checked) => setFormData({ ...formData, secure: checked as boolean })}
                />
                <Label htmlFor="secure">Use TLS/SSL (Secure Connection)</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Email/Username *</Label>
                <Input
                  id="username"
                  placeholder="your-email@gmail.com"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password/App Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password or app-specific password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email Address *</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  placeholder="noreply@example.com"
                  value={formData.fromEmail}
                  onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  placeholder="Tree Tracking System"
                  value={formData.fromName}
                  onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveConfig}>
                {selectedConfig ? "Update" : "Create"} Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : configs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">No SMTP Configurations</p>
            <p className="text-muted-foreground text-center mb-6">
              Create your first SMTP configuration to start sending OTPs and notifications
            </p>
            <Button onClick={() => handleOpenDialog()}>Create Configuration</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>From Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">{config.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{config.provider}</Badge>
                      </TableCell>
                      <TableCell>{config.host}:{config.port}</TableCell>
                      <TableCell>{config.fromEmail}</TableCell>
                      <TableCell>
                        {config.isActive ? (
                          <Badge className="gap-1 bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!config.isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActivateConfig(config.id)}
                              disabled={isLoading}
                              title="Activate this configuration"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerifyConnection(config)}
                            disabled={isVerifying}
                            title="Verify SMTP connection"
                          >
                            {isVerifying ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Dialog open={isTestingOpen} onOpenChange={setIsTestingOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedConfig(config)}
                                title="Send test email"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Send Test Email</DialogTitle>
                                <DialogDescription>
                                  Send a test email to verify the SMTP configuration
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="testEmail">Recipient Email</Label>
                                  <Input
                                    id="testEmail"
                                    type="email"
                                    placeholder="test@example.com"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsTestingOpen(false)}>
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleSendTestEmail(config.id)}
                                  disabled={isTesting}
                                >
                                  {isTesting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                  Send Test Email
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(config)}
                            title="Edit configuration"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={config.isActive}
                                title={config.isActive ? "Cannot delete active configuration" : "Delete configuration"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Configuration</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the "{config.name}" configuration? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteConfig(config.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">SMTP Configuration Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">🔗 Gmail SMTP Settings</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Host: smtp.gmail.com</li>
              <li>Port: 587 (TLS) or 465 (SSL)</li>
              <li>Username: your-email@gmail.com</li>
              <li>Password: Use an <a href="https://myaccount.google.com/apppasswords" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">App Password</a>, not your regular Gmail password</li>
              <li>Enable "Less secure app access" if using regular password</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">🔗 Outlook/Hotmail SMTP Settings</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Host: smtp.office365.com</li>
              <li>Port: 587 (TLS)</li>
              <li>Username: your-email@outlook.com</li>
              <li>Password: Your Outlook password</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">✅ Tips</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Always verify the connection before activating</li>
              <li>Send a test email to confirm it's working</li>
              <li>Only one SMTP configuration can be active at a time</li>
              <li>Passwords are encrypted in the database</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
