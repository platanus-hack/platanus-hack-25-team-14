import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { MedicalDocument, DocumentCategory } from '../types/medical';

const categoryLabels: Record<DocumentCategory, string> = {
  exam: 'Exam',
  appointment: 'Appointment',
  prescription: 'Prescription',
  'lab-result': 'Lab Result',
  imaging: 'Imaging',
  vaccination: 'Vaccination',
  other: 'Other',
};

const categoryColors: Record<DocumentCategory, string> = {
  exam: 'bg-green-100 text-green-800',
  appointment: 'bg-purple-100 text-purple-800',
  prescription: 'bg-orange-100 text-orange-800',
  'lab-result': 'bg-blue-100 text-blue-800',
  imaging: 'bg-pink-100 text-pink-800',
  vaccination: 'bg-teal-100 text-teal-800',
  other: 'bg-gray-100 text-gray-800',
};

interface DocumentDialogProps {
  document: MedicalDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentDialog({ document, open, onOpenChange }: DocumentDialogProps) {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between mb-2">
            <Badge className={categoryColors[document.category]}>
              {categoryLabels[document.category]}
            </Badge>
            <span className="text-gray-600">
              {new Date(document.date).toLocaleDateString('default', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          <DialogTitle>{document.title}</DialogTitle>
          {document.description && (
            <DialogDescription>{document.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {document.provider && (
            <div>
              <h3 className="text-gray-900 mb-1">Healthcare Provider</h3>
              <p className="text-gray-700">{document.provider}</p>
            </div>
          )}

          {document.notes && (
            <div>
              <h3 className="text-gray-900 mb-1">Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{document.notes}</p>
            </div>
          )}

          {document.fileName && (
            <div>
              <h3 className="text-gray-900 mb-1">File Name</h3>
              <p className="text-gray-700">{document.fileName}</p>
            </div>
          )}

          {document.metadata && (
            <div className="pt-4 border-t">
              <h3 className="text-gray-900 mb-2">AI Analysis</h3>
              <div className="space-y-2 text-gray-700">
                {document.metadata.aiClassification && (
                  <p>
                    Classification: {categoryLabels[document.metadata.aiClassification as DocumentCategory]}
                  </p>
                )}
                {document.metadata.confidence && (
                  <p>
                    Confidence: {(document.metadata.confidence * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
