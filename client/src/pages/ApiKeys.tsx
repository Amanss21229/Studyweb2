import { useState } from 'react';
import { usePageMeta } from "@/lib/usePageMeta";
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Copy, Trash2, Plus, Mail, Key, ExternalLink, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ADMIN_EMAIL = 'amanss21229@gmail.com';
const CONTACT_EMAIL = 'eduaman07@gmail.com';

export default function ApiKeys() {
  const [keyName, setKeyName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: apiKeys = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/keys'],
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Failed to create API key');
      return response.json();
    },
    onSuccess: (data) => {
      setNewApiKey(data.key);
      setKeyName('');
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
      toast({
        title: 'API Key Created',
        description: 'Your API key has been created successfully. Save it now!',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create API key',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/keys/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete API key');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
      toast({
        title: 'API Key Revoked',
        description: 'The API key has been revoked successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to revoke API key',
        variant: 'destructive',
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'API key copied to clipboard',
    });
  };

  const handleCreateKey = () => {
    if (!keyName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name for your API key',
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate(keyName.trim());
  };

  const handleCloseNewKeyDialog = () => {
    setNewApiKey(null);
    setShowCreateDialog(false);
  };

  const apiUrl = window.location.origin + '/api/solution';
  usePageMeta(
  "API Keys — AimAi",
  "Manage API keys and integrations for AimAi features.",
  "https://aimai.onrender.com/api-keys",
  "https://aimai.onrender.com/og-image.png"
);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-golden flex items-center gap-3">
              <Key className="w-8 h-8" />
              API Key Management
            </h1>
            <p className="text-gray-400 mt-2">Create and manage API keys for Telegram bot integration</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button 
                className="bg-golden hover:bg-golden-light text-black font-semibold"
                data-testid="button-create-key"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Key
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-golden-dark">
              <DialogHeader>
                <DialogTitle className="text-golden">Create New API Key</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Enter a name to identify this API key
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="e.g., Telegram Bot, Production API"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  data-testid="input-key-name"
                />
                <Button
                  onClick={handleCreateKey}
                  className="w-full bg-golden hover:bg-golden-light text-black font-semibold"
                  disabled={createMutation.isPending}
                  data-testid="button-submit-create"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create API Key'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {newApiKey && (
          <Dialog open={!!newApiKey} onOpenChange={handleCloseNewKeyDialog}>
            <DialogContent className="bg-gray-900 border-golden-dark max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-golden">API Key Created Successfully!</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Save this key securely. You won't be able to see it again!
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Alert className="bg-red-900/20 border-red-500">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-300 ml-2">
                    Copy this key now! It will not be shown again for security reasons.
                  </AlertDescription>
                </Alert>
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Your API Key:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-golden bg-gray-900 p-3 rounded text-sm break-all" data-testid="text-new-key">
                      {newApiKey}
                    </code>
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(newApiKey)}
                      className="bg-golden hover:bg-golden-light text-black"
                      data-testid="button-copy-new-key"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleCloseNewKeyDialog}
                  className="w-full bg-golden hover:bg-golden-light text-black font-semibold"
                  data-testid="button-close-dialog"
                >
                  I've Saved My Key
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Card className="bg-gray-900/50 border-golden-dark">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-golden" />
              API Endpoint URL
            </CardTitle>
            <CardDescription className="text-gray-400">
              Use this URL in your Telegram bot or other integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <code className="flex-1 text-golden text-sm" data-testid="text-api-url">
                {apiUrl}
              </code>
              <Button
                size="sm"
                onClick={() => copyToClipboard(apiUrl)}
                className="bg-golden hover:bg-golden-light text-black"
                data-testid="button-copy-url"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-500 text-xs mt-3">
              Include your API key in the <code className="text-golden bg-gray-800 px-1 rounded">X-API-Key</code> header
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-golden-dark">
          <CardHeader>
            <CardTitle className="text-white">Your API Keys</CardTitle>
            <CardDescription className="text-gray-400">
              Manage your active API keys
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No API keys yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key: any) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
                    data-testid={`card-key-${key.id}`}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-white" data-testid={`text-key-name-${key.id}`}>
                        {key.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <code className="text-golden text-sm bg-gray-900 px-2 py-1 rounded" data-testid={`text-key-value-${key.id}`}>
                          {key.key}
                        </code>
                        {key.lastUsed ? (
                          <span className="text-gray-500 text-xs">
                            Last used: {new Date(key.lastUsed).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">Never used</span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mt-1">
                        Created: {new Date(key.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(key.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${key.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-golden-dark">
          <CardHeader>
            <CardTitle className="text-white">Integration Example</CardTitle>
            <CardDescription className="text-gray-400">
              Example code for your Telegram bot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <pre className="text-sm text-gray-300 overflow-x-auto">
{`import requests

API_URL = "${apiUrl}"
API_KEY = "your-api-key-here"

response = requests.post(
    API_URL,
    headers={"X-API-Key": API_KEY},
    json={
        "question": "Explain photosynthesis",
        "language": "english"
    }
)

result = response.json()
print(result["solution"]["answer"])`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
