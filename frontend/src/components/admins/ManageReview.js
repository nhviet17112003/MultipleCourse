import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Badge, Dropdown, Table, Tag, Card, Space, Typography, Button, Input, Select, Row, Col } from 'antd';
import { toast, ToastContainer } from "react-toastify";
import { useTheme } from "../context/ThemeContext";
import { 
  EllipsisOutlined, 
  CheckOutlined, 
  StopOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  StarFilled,
  FilterOutlined,
  SortAscendingOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

export default function ManageReview() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    rating: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null
  });
  const token = localStorage.getItem('authToken');
  const { theme } = useTheme();

  useEffect(() => {
    fetchComments();
  }, [token]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/comments/show-all-comments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(response.data.comments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply filters
  const filteredData = comments.filter((comment) => {
    // Text search filter
    const matchesSearch = 
      comment.author.toLowerCase().includes(searchText.toLowerCase()) ||
      (comment.type === 'course' ? comment.courseTitle : comment.lessonTitle)
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      comment.comment.toLowerCase().includes(searchText.toLowerCase());

    // Type filter
    const matchesType = filters.type === 'all' || comment.type === filters.type;

    // Status filter
    const matchesStatus = 
      filters.status === 'all' || 
      (filters.status === 'active' && comment.status) || 
      (filters.status === 'inactive' && !comment.status);

    // Rating filter
    const matchesRating = 
      filters.rating === 'all' || 
      (filters.rating === '5' && comment.rating === 5) ||
      (filters.rating === '4' && comment.rating === 4) ||
      (filters.rating === '3' && comment.rating === 3) ||
      (filters.rating === '1-2' && (comment.rating === 1 || comment.rating === 2));

    return matchesSearch && matchesType && matchesStatus && matchesRating;
  });

  // Apply sorting
  const sortedData = sortConfig.key
    ? [...filteredData].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      })
    : filteredData;

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <SortAscendingOutlined className="opacity-30" />;
    }
    return sortConfig.direction === 'asc' ? (
      <SortAscendingOutlined />
    ) : (
      <SortAscendingOutlined className="rotate-180" />
    );
  };

  const columns = [
    {
      title: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort('type')}>
          Type 
          {/* {getSortIcon('type')} */}
        </div>
      ),
      dataIndex: 'type',
      key: 'type',
      sorter: true,
      render: (type) => (
        <Tag color={type === 'course' ? 'blue' : 'purple'} className="capitalize px-3 py-1">
          {type}
        </Tag>
      ),
    },
    {
      title: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort('author')}>
          Full Name 
          {/* {getSortIcon('author')} */}
        </div>
      ),
      dataIndex: 'author',
      key: 'author',
      sorter: true,
      render: (author) => <Text strong>{author}</Text>,
    },
    {
      title: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort('courseTitle')}>
          Course Name 
          {/* {getSortIcon('courseTitle')} */}
        </div>
      ),
      dataIndex: 'courseTitle',
      key: 'courseTitle',
      sorter: true,
      render: (title) => (
        <Text ellipsis={{ tooltip: title }} className="max-w-xs">
          {title}
        </Text>
      ),
    },
    {
      title: 'Content',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment) => (
        <Text ellipsis={{ tooltip: comment }} className="max-w-xs">
          {comment}
        </Text>
      ),
    },
    {
      title: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort('rating')}>
          Rating 
          {/* {getSortIcon('rating')} */}
        </div>
      ),
      dataIndex: 'rating',
      key: 'rating',
      sorter: true,
      render: (rating) => (
        <Space>
          {[...Array(5)].map((_, i) => (
            <StarFilled 
              key={i} 
              className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </Space>
      ),
    },
    {
      title: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort('status')}>
          Status 
          {/* {getSortIcon('status')} */}
        </div>
      ),
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (status) => (
        <Badge 
          status={status ? 'success' : 'error'} 
          text={
            <span className={`font-medium ${status ? 'text-green-600' : 'text-red-600'}`}>
              {status ? 'Active' : 'Inactive'}
            </span>
          }
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <DropDownMenu record={record} fetchComments={fetchComments} />
      ),
    },
  ];

  const data = sortedData.map((comment) => ({
    key: comment.commentId,
    author: comment.author,
    courseTitle: comment.type === 'course' ? comment.courseTitle : comment.lessonTitle,
    comment: comment.comment,
    rating: comment.rating,
    status: comment.status,
    type: comment.type,
    commentId: comment.commentId,
  }));

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} p-6`}>
      <Card 
        className={`shadow-lg rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}
        bordered={false}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <Title level={2} className={`m-0 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Manage Reviews
          </Title>
          <div className="flex items-center mt-4 sm:mt-0 space-x-4 w-full sm:w-auto">
            <Input
              placeholder="Search reviews..."
              prefix={<SearchOutlined className="text-gray-400" />}
              onChange={(e) => handleSearch(e.target.value)}
              className="rounded-md w-full sm:w-64"
              allowClear
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchComments}
              className={`flex items-center ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Area */}
        <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center mb-2">
            <FilterOutlined className="mr-2" />
            <Text strong className={theme === 'dark' ? 'text-white' : ''}>Filters</Text>
          </div>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8} md={6}>
              <div className="mb-2">
                <Text className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  Review Type
                </Text>
                <Select
                  value={filters.type}
                  onChange={(value) => handleFilterChange('type', value)}
                  style={{ width: '100%' }}
                  className="rounded-md"
                >
                  <Option value="all">All Types</Option>
                  <Option value="course">Course</Option>
                  <Option value="lesson">Lesson</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <div className="mb-2">
                <Text className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  Status
                </Text>
                <Select
                  value={filters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  style={{ width: '100%' }}
                  className="rounded-md"
                >
                  <Option value="all">All Status</Option>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <div className="mb-2">
                <Text className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  Rating
                </Text>
                <Select
                  value={filters.rating}
                  onChange={(value) => handleFilterChange('rating', value)}
                  style={{ width: '100%' }}
                  className="rounded-md"
                >
                  <Option value="all">All Ratings</Option>
                  <Option value="5">5 Stars</Option>
                  <Option value="4">4 Stars</Option>
                  <Option value="3">3 Stars</Option>
                  <Option value="1-2">1-2 Stars</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={8} md={6} className="mt-[26px] items-end">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => setFilters({ type: 'all', status: 'all', rating: 'all' })}
                className={`w-full ${theme === 'dark' ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Reset Filters
              </Button>
            </Col>
          </Row>
        </div>

        <Table 
          columns={columns} 
          dataSource={data} 
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            className: `${theme === 'dark' ? 'text-white' : 'text-gray-800'}`
          }}
          className={`${theme === 'dark' ? 'ant-table-dark' : ''}`}
          rowClassName={(record) => !record.status ? 'bg-red-50' : ''}
          scroll={{ x: 'max-content' }}
        />
      </Card>
      <ToastContainer theme={theme === "dark" ? "dark" : "light"} />
    </div>
  );
}

const DropDownMenu = ({ record, fetchComments }) => {
  const token = localStorage.getItem('authToken');
  const { theme } = useTheme();

  const toggleCommentStatus = async (type, commentId) => {
    try {
      const url = type === 'course' 
        ? `http://localhost:3000/api/comments/change-course-comment-status/${commentId}`
        : `http://localhost:3000/api/comments/change-lesson-comment-status/${commentId}`;
      
      await axios.put(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      fetchComments();
      toast.success('Comment status updated successfully');
    } catch (error) {
      console.error('Error updating comment status:', error);
      toast.error('Error updating comment status');
    }
  };

  const items = [
    {
      key: '1',
      label: (
        <div 
          onClick={() => toggleCommentStatus(record.type, record.commentId)}
          className={`flex items-center gap-2 px-4 py-2 text-sm ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-md transition-colors duration-150`}
        >
          {record.status ? (
            <>
              <StopOutlined className="text-red-500" />
              <span>Ban</span>
            </>
          ) : (
            <>
              <CheckOutlined className="text-green-500" />
              <span>Unban</span>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
      <Button
        type="text"
        icon={<EllipsisOutlined className="text-lg" />}
        className={`flex items-center justify-center w-8 h-8 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
      />
    </Dropdown>
  );
};