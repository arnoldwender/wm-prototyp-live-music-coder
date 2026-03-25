import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './store';

describe('File management in store', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState());
  });

  it('starts with one default file', () => {
    const files = useAppStore.getState().files;
    expect(files.length).toBe(1);
    expect(files[0].name).toBe('main.js');
    expect(files[0].engine).toBe('strudel');
    expect(files[0].active).toBe(true);
  });

  it('adds a new file', () => {
    useAppStore.getState().addFile('drums.js', 'strudel');
    const files = useAppStore.getState().files;
    expect(files.length).toBe(2);
    expect(files[1].name).toBe('drums.js');
  });

  it('removes a file', () => {
    useAppStore.getState().addFile('drums.js', 'strudel');
    const id = useAppStore.getState().files[1].id;
    useAppStore.getState().removeFile(id);
    expect(useAppStore.getState().files.length).toBe(1);
  });

  it('prevents removing the last file', () => {
    const id = useAppStore.getState().files[0].id;
    useAppStore.getState().removeFile(id);
    expect(useAppStore.getState().files.length).toBe(1);
  });

  it('sets active file', () => {
    useAppStore.getState().addFile('drums.js', 'strudel');
    const id = useAppStore.getState().files[1].id;
    useAppStore.getState().setActiveFile(id);
    expect(useAppStore.getState().files[1].active).toBe(true);
    expect(useAppStore.getState().files[0].active).toBe(false);
  });

  it('updates file code', () => {
    const id = useAppStore.getState().files[0].id;
    useAppStore.getState().updateFileCode(id, 'note("c3 e3")');
    expect(useAppStore.getState().files[0].code).toBe('note("c3 e3")');
  });

  it('renames a file', () => {
    const id = useAppStore.getState().files[0].id;
    useAppStore.getState().renameFile(id, 'melody.js');
    expect(useAppStore.getState().files[0].name).toBe('melody.js');
  });

  it('gets active file', () => {
    const active = useAppStore.getState().getActiveFile();
    expect(active).toBeDefined();
    expect(active?.active).toBe(true);
  });
});
