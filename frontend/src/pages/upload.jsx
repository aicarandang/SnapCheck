import React, { useRef, useState } from 'react';
import styles from '../styles/upload.module.css';
import { useNavigate } from 'react-router-dom';
import { getUploads, setUploads, setScanResults, getAnswerKey } from '../utils/localStorage';

function UploadSheets({ sheetId, onSeeResults }) {
  const [files, setFiles] = useState([]);
  const [statuses, setStatuses] = useState({}); 
  const [message, setMessage] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(f => 
      ['image/png', 'image/jpeg', 'application/pdf'].includes(f.type)
    );
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      const merged = [...prev];
      selectedFiles.forEach(f => {
        if (!names.has(f.name)) merged.push(f);
      });
      return merged;
    });
    setStatuses(prev => ({ ...prev, ...Object.fromEntries(selectedFiles.map(f => [f.name, 'idle'])) }));
    setUploads(sheetId, [...files, ...selectedFiles].map(file => ({ name: file.name, type: file.type })));
    e.target.value = '';
  };

  const handleBrowseClick = (e) => {
    e.stopPropagation();
    fileInputRef.current.click();
  };

  const handleCheckAll = async () => {
    setMessage('');
    setIsChecking(true);
    const answerKey = getAnswerKey(sheetId);
    if (!answerKey) {
      setMessage('Error: No answer key found for this sheet. Please add an answer key first.');
      setIsChecking(false);
      return;
    }
    for (const file of files) {
      setStatuses(prev => ({ ...prev, [file.name]: 'pending' }));
      try {
        const sheets = JSON.parse(localStorage.getItem('answerSheets') || '[]');
        const currentSheet = sheets.find(s => s.id === sheetId);
        if (!currentSheet) {
          throw new Error('Sheet not found');
        }
        const testInfo = {
          num_items: parseInt(currentSheet.form.numItems) || 0,
          num_choices: parseInt(currentSheet.form.numChoices) || 4,
          exam_type: currentSheet.form.examType || '',
          subject_name: currentSheet.form.subjectName || '',
          academic_term: currentSheet.form.academicTerm || '',
          grid_start_y: currentSheet.form.gridStartY || null,
          grid_layout_params: currentSheet.form.gridLayoutParams || null
        };
        const formData = new FormData();
        formData.append('file', file);
        formData.append('test_info', JSON.stringify(testInfo));
        formData.append('answer_key', JSON.stringify(answerKey));
        
        const apiUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(`${apiUrl}/check`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Check failed: ${errorText}`);
        }
        const result = await res.json();
        result.file_name = file.name;
        try {
          const prevResults = JSON.parse(localStorage.getItem(`scanResults_${sheetId}`) || '[]');
          localStorage.setItem(`scanResults_${sheetId}`, JSON.stringify([...prevResults, result]));
          setStatuses(prev => ({ ...prev, [file.name]: 'checked' }));
        } catch (storageError) {
          if (storageError.name === 'QuotaExceededError') {
            try {
              const keys = Object.keys(localStorage);
              keys.forEach(key => {
                if (key.startsWith('scanResults_')) {
                  localStorage.removeItem(key);
                }
              });
              localStorage.setItem(`scanResults_${sheetId}`, JSON.stringify([result]));
              setStatuses(prev => ({ ...prev, [file.name]: 'checked' }));
              setMessage('Storage was full. Old results cleared. Current result saved.');
            } catch (retryError) {
              console.error('Failed to save even after clearing storage:', retryError);
              setStatuses(prev => ({ ...prev, [file.name]: 'error' }));
              setMessage('Error: Storage is full and could not be cleared. Please clear some results manually.');
            }
          } else {
            throw storageError;
          }
        }
      } catch (err) {
        console.error('Error checking file:', err);
        setStatuses(prev => ({ ...prev, [file.name]: 'error' }));
        setMessage(`Error: ${err.message}`);
      }
    }
    setIsChecking(false);
    if (onSeeResults) {
      onSeeResults();
    } else {
      navigate('/generate', { state: { tab: 'results' } });
    }
  };

  return (
    <div className={`${styles.uploadOuter} ${files.length === 0 ? styles.uploadOuterEmpty : styles.uploadOuterWithFiles}`}>
      <div className={styles.pageContentTop}>
        <div 
          className={`${styles.uploadDropzone} ${files.length === 0 ? styles.uploadDropzoneLarge : styles.uploadDropzoneCompact}`} 
          onClick={handleBrowseClick}
        >
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            multiple
          />
          <div className={styles.uploadIcon}>
            <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 34V14M24 14L16 22M24 14L32 22" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="8" y="38" width="32" height="4" rx="2" fill="#666" fillOpacity="0.15"/>
            </svg>
          </div>
          <div className={styles.uploadText}>Drop or click to upload files</div>
        </div>
      </div>
      {files.length > 0 && (
        <div className={`${styles.uploadFilesList} ${styles.pageContentTop}`}>
          {files.map((f, idx) => (
            <div className={styles.uploadFileItem} key={f.name + idx}>
              <span className={styles.uploadFileName}>{f.name}</span>
              <span className={styles.uploadFileType}>
                {f.type === 'application/pdf' ? 'PDF' : f.type.replace('image/', '').toUpperCase()}
              </span>
              <span className={styles.uploadFileStatus}>
                {statuses[f.name] === 'checked' && '✅ Checked'}
                {statuses[f.name] === 'pending' && '⏳ Pending'}
                {statuses[f.name] === 'error' && '❌ Error'}
                {statuses[f.name] === 'idle' && '🕓 Ready'}
              </span>
              <button
                className={styles.uploadFileDeleteBtn}
                title="Remove file"
                type="button"
                onClick={() => {
                  const newFiles = files.filter((_, i) => i !== idx);
                  setFiles(newFiles);
                  setStatuses(prev => {
                    const copy = { ...prev };
                    delete copy[f.name];
                    return copy;
                  });
                  setUploads(sheetId, newFiles.map(file => ({ name: file.name, type: file.type })));
                }}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="5" x2="15" y2="15" />
                  <line x1="15" y1="5" x2="5" y2="15" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        className={styles.uploadScanBtn}
        onClick={handleCheckAll}
        disabled={files.length === 0 || isChecking}
      >
        {isChecking ? 'Checking...' : 'Scan & Check'}
      </button>
      {message && (
        <div className={styles.uploadMessage}>{message}</div>
      )}
    </div>
  );
}

export default UploadSheets;