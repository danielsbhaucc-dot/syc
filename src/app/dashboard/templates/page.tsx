'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LayoutTemplate, PlusCircle, Loader, FileText, ArrowRight } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Template {
  id: string;
  name: string;
  description?: string;
}

function AddTemplateDialog({ brigadeId }: { brigadeId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast({
        variant: 'destructive',
        title: 'שגיאה',
        description: 'יש למלא שם תבנית.',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const templatesCollection = collection(
        firestore,
        'brigades',
        brigadeId,
        'templates'
      );
      await addDoc(templatesCollection, {
        name,
        description,
        brigadeId,
      });
      toast({ title: 'הצלחה', description: 'התבנית נוצרה בהצלחה.' });
      setName('');
      setDescription('');
      setOpen(false);
    } catch (error) {
      console.error('Error adding template:', error);
      toast({
        variant: 'destructive',
        title: 'שגיאה',
        description: 'אירעה שגיאה ביצירת התבנית.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="ml-2" />
          צור תבנית חדשה
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>יצירת תבנית תקן חדשה</DialogTitle>
          <DialogDescription>
            הגדר את שם התבנית והתיאור שלה. בהמשך תוכל להוסיף לה תפקידים וציוד.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                שם התבנית
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder='לדוגמה: תקן גדוד חי"ר'
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                תיאור
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="(אופציונלי)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader className="animate-spin ml-2" /> : null}
              {isSubmitting ? 'יוצר...' : 'צור תבנית'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TemplatesList({ brigadeId }: { brigadeId: string }) {
    const firestore = useFirestore();

    const templatesQuery = useMemoFirebase(() => {
        if (!firestore || !brigadeId) return null;
        return collection(firestore, 'brigades', brigadeId, 'templates');
    }, [firestore, brigadeId]);

    const { data: templates, isLoading, error } = useCollection<Template>(templatesQuery);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-12">
                <Loader className="mr-2 h-5 w-5 animate-spin" />
                טוען תבניות...
            </div>
        )
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">שגיאה בטעינת התבניות: {error.message}</div>
    }

    return (
        <>
        {templates && templates.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                    <Card key={template.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="text-primary"/>
                                {template.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground">{template.description || 'אין תיאור לתבנית זו.'}</p>
                        </CardContent>
                        <CardContent>
                             <Button variant="outline" className="w-full" asChild>
                               <Link href={`/dashboard/templates/${template.id}`}>
                                  ערוך תבנית
                                  <ArrowRight className="mr-2 h-4 w-4" />
                                </Link>
                              </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : (
             <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <LayoutTemplate className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                לא נוצרו עדיין תבניות
                </h3>
                <p className="max-w-md mb-6">
                התחל על ידי יצירת התבנית הראשונה שתגדיר את התקנים עבור היחידות שלך.
                </p>
                <AddTemplateDialog brigadeId={brigadeId} />
            </div>
        )}
        </>
    )
}

export default function TemplatesPage() {
  const { user } = useUser();
  const brigadeId = user?.uid;

  return (
    <div dir="rtl" className="w-full space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">
          ניהול תבניות תקן
        </h1>
        {brigadeId && <AddTemplateDialog brigadeId={brigadeId} />}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>התבניות שלי</CardTitle>
        </CardHeader>
        <CardContent>
            {brigadeId ? <TemplatesList brigadeId={brigadeId} /> : <p>טוען משתמש...</p>}
        </CardContent>
      </Card>
    </div>
  );
}
