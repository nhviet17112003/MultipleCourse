import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Space, 
  Table, 
  Card, 
  Typography, 
  Tag, 
  Input, 
  Button, 
  Empty, 
  Skeleton, 
  Alert,
  DatePicker,
  Badge
} from 'antd';
import { 
  HistoryOutlined, 
  ReloadOutlined, 
  SearchOutlined, 
  CalendarOutlined 
} from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function ActivitiesHistory() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const token = localStorage.getItem('authToken');
  const { theme } = useTheme();

  const fetchActivities = () => {
    setLoading(true);
    axios.get('http://localhost:3000/api/admin-activity/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        setActivities(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchActivities();
  }, [token]);

  // Determine activity type for styling
  const getActivityType = (activity) => {
    const lowerActivity = activity.toLowerCase();
    if (lowerActivity.includes('created') || lowerActivity.includes('added')) {
      return 'create';
    } else if (lowerActivity.includes('updated') || lowerActivity.includes('modified')) {
      return 'update';
    } else if (lowerActivity.includes('deleted') || lowerActivity.includes('removed')) {
      return 'delete';
    } else if (lowerActivity.includes('approved')) {
      return 'approve';
    } else if (lowerActivity.includes('rejected')) {
      return 'reject';
    } else if (lowerActivity.includes('login') || lowerActivity.includes('logged in')) {
      return 'login';
    } else {
      return 'other';
    }
  };

  // Get activity badge color
  const getActivityColor = (type) => {
    switch (type) {
      case 'create':
        return 'green';
      case 'update':
        return 'blue';
      case 'delete':
        return 'red';
      case 'approve':
        return 'cyan';
      case 'reject':
        return 'orange';
      case 'login':
        return 'geekblue';
      default:
        return 'default';
    }
  };

  // Get activity icon
  const getActivityIcon = (type) => {
    return <Badge color={getActivityColor(type)} />;
  };

  // Filter data by search text and date range
  const filteredData = activities
    .filter(activity => 
      activity.description.toLowerCase().includes(searchText.toLowerCase())
    )
    .filter(activity => {
      if (!dateRange) return true;
      const activityDate = new Date(activity.entry_date);
      return activityDate >= dateRange[0].startOf('day') && 
             activityDate <= dateRange[1].endOf('day');
    })
    .map((activity, index) => {
      const activityType = getActivityType(activity.description);
      return {
        key: activity._id || index,
        activity: activity.description,
        type: activityType,
        time: new Date(activity.entry_date),
        rawTime: activity.entry_date
      };
    });

  const columns = [
    {
      title: 'Activity',
      dataIndex: 'activity',
      key: 'activity',
      render: (text, record) => (
        <div className="flex items-center gap-2">
          {getActivityIcon(record.type)}
          <Text
            className={`${theme === 'dark' ? 'text-gray-100' : ''}`}
            style={{ maxWidth: 500 }}
            ellipsis={{ tooltip: text }}
          >
            {text}
          </Text>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const color = getActivityColor(type);
        return (
          <Tag color={color} className="capitalize px-2 py-1">
            {type}
          </Tag>
        );
      },
      filters: [
        { text: 'Created', value: 'create' },
        { text: 'Updated', value: 'update' },
        { text: 'Deleted', value: 'delete' },
        { text: 'Approved', value: 'approve' },
        { text: 'Rejected', value: 'reject' },
        { text: 'Login', value: 'login' },
        { text: 'Other', value: 'other' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Date',
      dataIndex: 'time',
      key: 'date',
      render: (time) => time.toLocaleDateString(),
      sorter: (a, b) => new Date(a.rawTime) - new Date(b.rawTime),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      render: (time) => time.toLocaleTimeString(),
    },
  ];

  const handleReset = () => {
    setSearchText('');
    setDateRange(null);
    fetchActivities();
  };

  const renderSkeleton = () => (
    <div className="space-y-4">
      <Skeleton active paragraph={{ rows: 1 }} />
      <Skeleton active paragraph={{ rows: 1 }} />
      <Skeleton active paragraph={{ rows: 1 }} />
      <Skeleton active paragraph={{ rows: 1 }} />
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} p-6`}>
      <Card 
        className={`shadow-lg rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`} 
        bordered={false}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <HistoryOutlined className={`text-2xl mr-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
            <Title level={2} className={`m-0 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Activities History
            </Title>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Input
              placeholder="Search activities..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="rounded-md w-full sm:w-64"
              allowClear
            />
            
            <RangePicker 
              className="w-full sm:w-auto"
              onChange={(dates) => setDateRange(dates)}
              placeholder={['Start date', 'End date']}
            />
            
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              className={`flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              Reset
            </Button>
          </div>
        </div>
        
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}
        
        <div className="overflow-x-auto">
          {loading ? (
            renderSkeleton()
          ) : (
            <Table 
              columns={columns} 
              dataSource={filteredData}
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} activities`,
              }}
              rowClassName={(record) => 
                record.type === 'delete' ? (theme === 'dark' ? 'bg-red-900 bg-opacity-20' : 'bg-red-50') :
                record.type === 'create' ? (theme === 'dark' ? 'bg-green-900 bg-opacity-20' : 'bg-green-50') :
                ''
              }
              locale={{
                emptyText: (
                  <Empty 
                    description="No activities found" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  />
                )
              }}
              className={`${theme === 'dark' ? 'ant-table-dark' : ''}`}
              summary={(pageData) => {
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={4} className="text-right">
                      <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Total activities: {filteredData.length}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          )}
        </div>
        
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <CalendarOutlined className="mr-1" />
          <span>Activities are sorted by most recent first</span>
        </div>
      </Card>
    </div>
  );
}