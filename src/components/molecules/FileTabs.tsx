/* ──────────────────────────────────────────────────────────
   FileTabs molecule — tab bar showing all open project files
   with a "+" button to create new files. Each tab shows the
   engine color dot, file name, and close button on hover.
   ────────────────────────────────────────────────────────── */

import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../lib/store';
import { TabButton } from '../atoms/TabButton';
import Button from '../atoms/Button';

/** Tab bar showing all open files + new file button */
export function FileTabs() {
  const { t } = useTranslation();
  const files = useAppStore((s) => s.files);
  const defaultEngine = useAppStore((s) => s.defaultEngine);
  const setActiveFile = useAppStore((s) => s.setActiveFile);
  const removeFile = useAppStore((s) => s.removeFile);
  const addFile = useAppStore((s) => s.addFile);

  const handleNewFile = () => {
    const count = files.length + 1;
    addFile(`file${count}.js`, defaultEngine);
  };

  return (
    <nav
      className="flex items-center border-b overflow-x-auto shrink-0"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-alt)' }}
      role="tablist"
      aria-label={t('panels.editor')}
    >
      {files.map((file) => (
        <TabButton
          key={file.id}
          name={file.name}
          engine={file.engine}
          active={file.active}
          onClick={() => setActiveFile(file.id)}
          onClose={() => removeFile(file.id)}
          closable={files.length > 1}
        />
      ))}
      <Button
        variant="ghost"
        onClick={handleNewFile}
        aria-label="New file"
        className="!p-1 ml-1"
      >
        <Plus size={14} />
      </Button>
    </nav>
  );
}
