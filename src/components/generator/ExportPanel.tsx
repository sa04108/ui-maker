import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button, Select } from '@/components/common';
import { EXPORT_SIZES, downloadSvgAsPng, downloadSvg, type ExportSize } from '@/services/export';

interface ExportPanelProps {
  svg: string | null;
  subject: string;
}

const sizeOptions = EXPORT_SIZES.map((size) => ({
  value: String(size),
  label: `${size}x${size}`,
}));

export function ExportPanel({ svg, subject }: ExportPanelProps) {
  const [selectedSize, setSelectedSize] = useState<ExportSize>(64);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPng = async () => {
    if (!svg) return;
    setIsExporting(true);
    try {
      await downloadSvgAsPng(svg, subject || 'icon', selectedSize);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSvg = () => {
    if (!svg) return;
    downloadSvg(svg, subject || 'icon');
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-300">Export</h3>
      <div className="flex gap-2">
        <Select
          options={sizeOptions}
          value={String(selectedSize)}
          onChange={(e) => setSelectedSize(Number(e.target.value) as ExportSize)}
          className="w-32"
        />
        <Button
          onClick={handleExportPng}
          disabled={!svg || isExporting}
          className="flex-1"
        >
          <Download size={16} className="mr-2" />
          PNG
        </Button>
        <Button
          variant="secondary"
          onClick={handleExportSvg}
          disabled={!svg}
        >
          <Download size={16} className="mr-2" />
          SVG
        </Button>
      </div>
    </div>
  );
}
