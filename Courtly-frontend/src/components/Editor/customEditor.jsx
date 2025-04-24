import dynamic from 'next/dynamic';

const CustomEditor = dynamic(() => import('./customEditorBuild'), { ssr: false });

export default CustomEditor;