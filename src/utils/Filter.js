import React, { useState } from 'react';
import DateRangePicker from 'react-daterange-picker';
import 'react-daterange-picker/dist/css/react-calendar.css';
import moment from 'moment';

const OrderDashboardFilter = ({ onDateRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState(null);

  // Predefined date range options
  const dateRangePresets = [
    {
      label: '1 Tháng trước',
      range: () => ({
        start: moment().subtract(1, 'month').startOf('month'),
        end: moment().subtract(1, 'month').endOf('month')
      })
    },
    {
      label: '3 Tháng trước',
      range: () => ({
        start: moment().subtract(3, 'month').startOf('month'),
        end: moment().endOf('month')
      })
    },
    {
      label: 'Năm nay',
      range: () => ({
        start: moment().startOf('year'),
        end: moment().endOf('month')
      })
    },
    {
      label: 'Năm ngoái',
      range: () => ({
        start: moment().subtract(1, 'year').startOf('year'),
        end: moment().subtract(1, 'year').endOf('year')
      })
    }
  ];

  const handleSelect = (range) => {
    setDateRange(range);
    setIsOpen(false);
    
    if (range && range.start && range.end) {
      onDateRangeChange({
        startDate: range.start.format('YYYY-MM-DD'),
        endDate: range.end.format('YYYY-MM-DD')
      });
    }
  };

  const handlePresetSelect = (preset) => {
    const selectedRange = preset.range();
    const range = {
      start: selectedRange.start,
      end: selectedRange.end
    };
    handleSelect(range);
  };

  const renderDateRangeLabel = () => {
    if (!dateRange || !dateRange.start || !dateRange.end) {
      return 'Chọn ngày cụ thể';
    }
    
    // Use moment's format method safely
    return `${dateRange.start.format('DD/MM/YYYY')} - ${dateRange.end.format('DD/MM/YYYY')}`;
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white text-black px-4 py-2 rounded z-[99999999999] border"
      >
        {renderDateRangeLabel()}
      </button>

      {isOpen && (
        <div className="fixed mt-2 bg-white border rounded shadow-lg z-[99999999999]">
          <div className="flex">
            <div className="border-r p-2">
              <h3 className="font-bold mb-2">Preset Ranges</h3>
              {dateRangePresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetSelect(preset)}
                  className="block w-full text-left px-2 py-1 hover:bg-blue-100"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <DateRangePicker
              value={dateRange}
              onSelect={handleSelect}
              singleDateRange={false}
              numberOfCalendars={2}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDashboardFilter;