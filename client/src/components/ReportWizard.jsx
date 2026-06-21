import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Check, ChevronLeft, ChevronRight, ImagePlus, Loader2, Send, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import LocationPicker from './LocationPicker';
import { CATEGORIES, CATEGORY_META } from '../lib/constants';
import { createIssue } from '../lib/api';
import { useToast } from './ToastProvider';

const steps = ['Location', 'Photo', 'Category', 'Details'];

async function compressImage(file) {
  const bitmap = await createImageBitmap(file);
  const maxWidth = 1280;
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })),
      'image/jpeg',
      0.82
    );
  });
}

export default function ReportWizard({ modal = false }) {
  const navigate = useNavigate();
  const { push } = useToast();
  const closeButtonRef = useRef(null);
  const [step, setStep] = useState(0);
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape' && modal) navigate(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal, navigate]);

  const errors = useMemo(
    () => [
      !position ? 'Choose a map pin or use your current location.' : '',
      !photo ? 'Add a photo of the issue.' : '',
      !category ? 'Select one issue category.' : '',
      !title.trim() ? 'Add a short title.' : !description.trim() ? 'Add a description.' : ''
    ],
    [position, photo, category, title, description]
  );

  const canContinue = !errors[step];

  const choosePhoto = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      push('Please choose an image file.', 'error');
      return;
    }
    const compressed = await compressImage(file);
    setPhoto(compressed);
    setPreview(URL.createObjectURL(compressed));
    push('Photo compressed and ready.', 'success');
  };

  const submit = async () => {
    if (errors.some(Boolean)) {
      push(errors.find(Boolean), 'error');
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.set('title', title.trim());
      form.set('description', description.trim());
      form.set('category', category);
      form.set('lat', position[0]);
      form.set('lng', position[1]);
      form.set('address', address.trim());
      form.set('photo', photo);
      const created = await createIssue(form);
      push('Issue submitted. The city pulse just updated.', 'success');
      navigate(`/issue/${created.id}`);
    } catch (error) {
      push(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const content = (
    <div className="w-full max-w-3xl rounded-lg bg-white shadow-civic ring-1 ring-black/5">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4 sm:p-5">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-saffron">Report Issue</p>
          <h1 className="mt-1 text-2xl font-black text-ink">Help fix a local problem</h1>
        </div>
        <button ref={closeButtonRef} type="button" onClick={() => navigate(-1)} className="focus-ring rounded-full p-2 text-slate-600 hover:bg-slate-100" aria-label="Close report form">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
        <div className="grid grid-cols-4 gap-2">
          {steps.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => index <= step && setStep(index)}
              className={`h-2 rounded-full transition ${index <= step ? 'bg-teal-civic' : 'bg-slate-200'}`}
              aria-label={label}
            />
          ))}
        </div>
        <p className="mt-2 text-sm font-bold text-slate-600">
          Step {step + 1} of 4: {steps[step]}
        </p>
      </div>

      <div className="min-h-[440px] p-4 sm:p-5">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.section key="location" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
              <LocationPicker position={position} onPick={setPosition} onError={(message) => push(message, 'error')} />
              <label className="block">
                <span className="text-sm font-black text-ink">Landmark or area</span>
                <input value={address} onChange={(event) => setAddress(event.target.value)} className="focus-ring mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Example: New Market back lane" />
              </label>
            </motion.section>
          )}

          {step === 1 && (
            <motion.section key="photo" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
              <label
                onDrop={(event) => {
                  event.preventDefault();
                  choosePhoto(event.dataTransfer.files[0]);
                }}
                onDragOver={(event) => event.preventDefault()}
                className="focus-within:ring-4 focus-within:ring-amber-200 flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-teal-civic/50 bg-teal-civic/5 p-6 text-center"
              >
                {preview ? (
                  <img src={preview} alt="Selected issue preview" className="max-h-72 rounded-lg object-contain" />
                ) : (
                  <>
                    <ImagePlus className="h-12 w-12 text-teal-civic" />
                    <p className="mt-3 text-lg font-black text-ink">Drop a photo or tap to choose</p>
                    <p className="mt-1 text-sm text-slate-600">Mobile camera capture is supported.</p>
                  </>
                )}
                <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => choosePhoto(event.target.files[0])} />
              </label>
              <button type="button" onClick={() => document.querySelector('input[type=file]')?.click()} className="focus-ring inline-flex items-center gap-2 rounded-full bg-teal-civic px-4 py-2 font-black text-white">
                <Camera className="h-4 w-4" />
                Choose Another Photo
              </button>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section key="category" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-3 sm:grid-cols-2">
              {CATEGORIES.map((item) => {
                const meta = CATEGORY_META[item];
                const Icon = meta.icon;
                const active = category === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`focus-ring flex items-center gap-3 rounded-lg border p-4 text-left transition ${active ? 'border-teal-civic bg-teal-civic/10' : 'border-slate-200 bg-white hover:border-teal-civic/60'}`}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: meta.color }}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-black text-ink">{item}</span>
                    {active && <Check className="ml-auto h-5 w-5 text-teal-civic" />}
                  </button>
                );
              })}
            </motion.section>
          )}

          {step === 3 && (
            <motion.section key="details" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
              <label className="block">
                <span className="flex justify-between gap-3 text-sm font-black text-ink">
                  Title <span className="text-slate-500">{title.length}/100</span>
                </span>
                <input maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} className="focus-ring mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Example: Streetlight out near lake road" />
              </label>
              <label className="block">
                <span className="flex justify-between gap-3 text-sm font-black text-ink">
                  Description <span className="text-slate-500">{description.length}/500</span>
                </span>
                <textarea maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} rows={8} className="focus-ring mt-1 w-full resize-none rounded-lg border border-slate-300 px-3 py-2" placeholder="Describe what is happening and who is affected." />
              </label>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4 sm:p-5">
        <p className="text-sm font-bold text-red-600">{errors[step]}</p>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0 || submitting} className="focus-ring inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 font-black text-ink disabled:cursor-not-allowed disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          {step < 3 ? (
            <button type="button" onClick={() => setStep((value) => value + 1)} disabled={!canContinue} className="focus-ring inline-flex items-center gap-2 rounded-full bg-teal-civic px-4 py-2 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={submitting || errors.some(Boolean)} className="focus-ring inline-flex items-center gap-2 rounded-full bg-saffron px-5 py-2 font-black text-ink disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? 'Submitting...' : 'Submit Issue'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!modal) return <main className="mx-auto flex max-w-7xl justify-center px-4 py-8">{content}</main>;

  return (
    <div className="fixed inset-0 z-[980] overflow-y-auto bg-ink/55 px-3 py-5 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="mx-auto flex min-h-full items-center justify-center">{content}</div>
    </div>
  );
}
