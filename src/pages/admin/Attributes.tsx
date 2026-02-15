import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { METAL_TYPE_NAMES } from '@/lib/types';
import {
  useAttributeTemplates,
  useCreateAttributeTemplate,
  useUpdateAttributeTemplate,
  useDeleteAttributeTemplate,
  useAttributeTemplateOptions,
  useCreateAttributeOption,
  useUpdateAttributeOption,
  useDeleteAttributeOption,
  type AttributeTemplate,
  type AttributeTemplateOption,
} from '@/hooks/useAttributeTemplates';
import { Plus, Trash2, Edit, Loader2, Layers } from 'lucide-react';

const TEMPLATE_TYPES: AttributeTemplate['template_type'][] = [
  'metal_type',
  'size',
  'gemstone_quality',
  'carat_weight',
  'certificate',
  'add_on',
];

const typeLabels: Record<AttributeTemplate['template_type'], string> = {
  metal_type: 'Metal Type',
  size: 'Size',
  gemstone_quality: 'Gemstone Quality',
  carat_weight: 'Total Carat Weight',
  certificate: 'Certificate',
  add_on: 'Add On',
};

export default function AdminAttributes() {
  const { toast } = useToast();
  const { data: templates = [], isLoading } = useAttributeTemplates();
  const createTemplate = useCreateAttributeTemplate();
  const updateTemplate = useUpdateAttributeTemplate();
  const deleteTemplate = useDeleteAttributeTemplate();

  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AttributeTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<Omit<AttributeTemplate, 'id'>>({
    name: '',
    slug: '',
    template_type: 'metal_type',
    selection_mode: 'single',
    display_order: 0,
    is_active: true,
  });

  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const { data: options = [], isLoading: optionsLoading } = useAttributeTemplateOptions(activeTemplateId || undefined);
  const createOption = useCreateAttributeOption();
  const updateOption = useUpdateAttributeOption();
  const deleteOption = useDeleteAttributeOption();

  const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<AttributeTemplateOption | null>(null);
  const [optionForm, setOptionForm] = useState<Omit<AttributeTemplateOption, 'id'>>({
    template_id: '',
    label: '',
    value: '',
    metal_type: null,
    price_adjustment: 0,
    weight_adjustment: 0,
    image_url: null,
    is_default: false,
    is_active: true,
    display_order: 0,
  });
  const activeTemplate = templates.find(t => t.id === activeTemplateId) || null;

  const openTemplateDialog = (template?: AttributeTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name,
        slug: template.slug,
        template_type: template.template_type,
        selection_mode: template.selection_mode,
        display_order: template.display_order || 0,
        is_active: template.is_active ?? true,
      });
    } else {
      setEditingTemplate(null);
      setTemplateForm({
        name: '',
        slug: '',
        template_type: 'metal_type',
        selection_mode: 'single',
        display_order: 0,
        is_active: true,
      });
    }
    setIsTemplateDialogOpen(true);
  };

  const saveTemplate = async () => {
    try {
      if (!templateForm.name || !templateForm.slug) {
        throw new Error('Name and slug are required');
      }
      if (editingTemplate) {
        await updateTemplate.mutateAsync({ id: editingTemplate.id, ...templateForm });
        toast({ title: 'Updated', description: 'Attribute updated' });
      } else {
        await createTemplate.mutateAsync(templateForm);
        toast({ title: 'Created', description: 'Attribute created' });
      }
      setIsTemplateDialogOpen(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed', variant: 'destructive' });
    }
  };

  const openOptionDialog = (option?: AttributeTemplateOption) => {
    if (!activeTemplateId) return;
    if (option) {
      setEditingOption(option);
      setOptionForm({
        template_id: option.template_id,
        label: option.label,
        value: option.value,
        metal_type: option.metal_type,
        price_adjustment: option.price_adjustment || 0,
        weight_adjustment: option.weight_adjustment || 0,
        image_url: option.image_url || null,
        is_default: option.is_default ?? false,
        is_active: option.is_active ?? true,
        display_order: option.display_order || 0,
      });
    } else {
      setEditingOption(null);
      setOptionForm({
        template_id: activeTemplateId,
        label: '',
        value: '',
        metal_type: null,
        price_adjustment: 0,
        weight_adjustment: 0,
        image_url: null,
        is_default: false,
        is_active: true,
        display_order: 0,
      });
    }
    setIsOptionDialogOpen(true);
  };

  const saveOption = async () => {
    try {
      if (!optionForm.label || !optionForm.value) {
        throw new Error('Label and value are required');
      }
      if (editingOption) {
        await updateOption.mutateAsync({ id: editingOption.id, template_id: optionForm.template_id, ...optionForm });
        toast({ title: 'Updated', description: 'Option updated' });
      } else {
        await createOption.mutateAsync(optionForm);
        toast({ title: 'Created', description: 'Option created' });
      }
      setIsOptionDialogOpen(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-semibold">Attributes</h1>
            <p className="text-muted-foreground">Manage global attributes and options</p>
          </div>
          <Button className="btn-premium" onClick={() => openTemplateDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Attribute
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Attribute Templates
            </CardTitle>
            <CardDescription>Define global attributes like Metal Type, Size, Certificates</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((t) => (
                    <TableRow key={t.id} className={activeTemplateId === t.id ? 'bg-secondary/30' : ''}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{typeLabels[t.template_type]}</TableCell>
                      <TableCell className="capitalize">{t.selection_mode}</TableCell>
                      <TableCell>{t.is_active ? 'Active' : 'Disabled'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setActiveTemplateId(t.id)}>
                            Options
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openTemplateDialog(t)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => deleteTemplate.mutate(t.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {activeTemplateId && (
          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
              <CardDescription>Manage options for the selected attribute</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-3">
                <div className="text-sm text-muted-foreground">
                  {templates.find(t => t.id === activeTemplateId)?.name}
                </div>
                <Button size="sm" onClick={() => openOptionDialog()}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Option
                </Button>
              </div>
              {optionsLoading ? (
                <div className="py-6 text-center text-muted-foreground">Loading options...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Price Adj.</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {options.map((opt) => (
                      <TableRow key={opt.id}>
                        <TableCell className="font-medium">{opt.label}</TableCell>
                        <TableCell>{opt.value}</TableCell>
                        <TableCell>₹{opt.price_adjustment?.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{opt.is_active ? 'Active' : 'Disabled'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openOptionDialog(opt)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => deleteOption.mutate({ id: opt.id, template_id: opt.template_id })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Attribute' : 'Add Attribute'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={templateForm.name} onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={templateForm.slug} onChange={(e) => setTemplateForm(prev => ({ ...prev, slug: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={templateForm.template_type}
                onValueChange={(value: AttributeTemplate['template_type']) =>
                  setTemplateForm(prev => ({ ...prev, template_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{typeLabels[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Selection Mode</Label>
              <Select
                value={templateForm.selection_mode}
                onValueChange={(value: 'single' | 'multi') =>
                  setTemplateForm(prev => ({ ...prev, selection_mode: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="multi">Multi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={templateForm.is_active} onCheckedChange={(v) => setTemplateForm(prev => ({ ...prev, is_active: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>Cancel</Button>
            <Button className="btn-premium" onClick={saveTemplate} disabled={createTemplate.isPending || updateTemplate.isPending}>
              {(createTemplate.isPending || updateTemplate.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Option Dialog */}
      <Dialog open={isOptionDialogOpen} onOpenChange={setIsOptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingOption ? 'Edit Option' : 'Add Option'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Label</Label>
              <Input value={optionForm.label} onChange={(e) => setOptionForm(prev => ({ ...prev, label: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <Input value={optionForm.value} onChange={(e) => setOptionForm(prev => ({ ...prev, value: e.target.value }))} />
            </div>
            {activeTemplate?.template_type === 'metal_type' && (
              <div className="space-y-2">
                <Label>Metal Key (optional)</Label>
                <Select
                  value={optionForm.metal_type || undefined}
                  onValueChange={(value: string) => setOptionForm(prev => ({ ...prev, metal_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select metal key" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(METAL_TYPE_NAMES).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price Adjustment (₹)</Label>
                <Input
                  type="number"
                  value={optionForm.price_adjustment}
                  onChange={(e) => setOptionForm(prev => ({ ...prev, price_adjustment: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Weight Adjustment (g)</Label>
                <Input
                  type="number"
                  value={optionForm.weight_adjustment}
                  onChange={(e) => setOptionForm(prev => ({ ...prev, weight_adjustment: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image URL (optional)</Label>
              <Input value={optionForm.image_url || ''} onChange={(e) => setOptionForm(prev => ({ ...prev, image_url: e.target.value || null }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Default</Label>
              <Switch checked={optionForm.is_default} onCheckedChange={(v) => setOptionForm(prev => ({ ...prev, is_default: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={optionForm.is_active} onCheckedChange={(v) => setOptionForm(prev => ({ ...prev, is_active: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOptionDialogOpen(false)}>Cancel</Button>
            <Button className="btn-premium" onClick={saveOption} disabled={createOption.isPending || updateOption.isPending}>
              {(createOption.isPending || updateOption.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
