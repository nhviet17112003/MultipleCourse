import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Card, Spin, Alert, Typography, Tag, Space, Divider, Input, Select, DatePicker, Button, Row, Col } from "antd";
import { ShoppingCartOutlined, HistoryOutlined, FilterOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function BuyerHistory() {
  const [buyerHistory, setBuyerHistory] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");
  
  // Filter states
  const [searchEmail, setSearchEmail] = useState("");
  const [searchCourseName, setSearchCourseName] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    const fetchBuyerHistory = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/orders/all-purchase-course",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setBuyerHistory(res.data);
        setFilteredData(res.data);
        console.log("Buyer:", res.data);

        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchBuyerHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchEmail, searchCourseName, priceRange, dateRange]);

  const applyFilters = () => {
    let filtered = buyerHistory;

    // Filter by email
    if (searchEmail) {
      filtered = filtered.filter(order => 
        order.buyers.some(buyer => 
          buyer.email.toLowerCase().includes(searchEmail.toLowerCase())
        )
      );
    }

    // Filter by course name
    if (searchCourseName) {
      filtered = filtered.filter(order => 
        order.course.title.toLowerCase().includes(searchCourseName.toLowerCase())
      );
    }

    // Filter by price range
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      filtered = filtered.filter(order => {
        const price = parseFloat(order.course.price);
        if (max) {
          return price >= min && price <= max;
        } else {
          return price >= min;
        }
      });
    }

    // Filter by date range
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.course.date);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    setFilteredData(filtered);
  };

  const resetFilters = () => {
    setSearchEmail("");
    setSearchCourseName("");
    setPriceRange("all");
    setDateRange(null);
    setFilteredData(buyerHistory);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
    
  if (error)
    return (
      <div className="p-4">
        <Alert
          message="Lỗi"
          description={error.message}
          type="error"
          showIcon
        />
      </div>
    );

  const columns = [
    {
      title: "Buyer Email",
      dataIndex: "buyerEmail",
      key: "buyerEmail",
      sorter: (a, b) => a.buyerEmail[0].localeCompare(b.buyerEmail[0]),
      render: (emails) => (
        <Space direction="vertical" size="small">
          {emails.map((email, idx) => (
            <Tag color="blue" key={idx} className="px-2 py-1 text-sm">
              {email}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Course Name",
      dataIndex: "courseName",
      key: "courseName",
      sorter: (a, b) => a.courseName.localeCompare(b.courseName),
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => {
        const priceA = parseFloat(a.price.replace(" VND", ""));
        const priceB = parseFloat(b.price.replace(" VND", ""));
        return priceA - priceB;
      },
      render: (price) => (
        <Tag color="green" className="px-3 py-1">
          {price}
        </Tag>
      ),
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
      sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
      render: (date) => (
        <Text type="secondary" className="text-sm">
          {date}
        </Text>
      ),
    },
  ];

  const data = filteredData.map((order, index) => ({
    key: index,
    buyerEmail: order.buyers.map((buyer) => buyer.email),
    courseName: order.course.title,
    price: order.course.price + " VND",
    orderDate: new Date(order.course.date).toLocaleDateString(),
    rawDate: order.course.date, // For sorting
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Card 
        className="shadow-xl rounded-lg overflow-hidden"
        bordered={false}
      >
        <div className="flex items-center justify-center mb-6">
          <HistoryOutlined className="text-blue-500 text-3xl mr-4" />
          <Title level={2} className="m-0 text-blue-800">
            Buyer History
          </Title>
        </div>
        
        <Divider className="mb-6" />
        
        {/* Filter section */}
        <Card className="mb-6 bg-gray-50">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Input
                placeholder="Search buyer email"
                prefix={<SearchOutlined />}
                value={searchEmail}
                onChange={e => setSearchEmail(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} md={12}>
              <Input
                placeholder="Search course name"
                prefix={<SearchOutlined />}
                value={searchCourseName}
                onChange={e => setSearchCourseName(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by price"
                value={priceRange}
                onChange={value => setPriceRange(value)}
              >
                <Option value="all">All prices</Option>
                <Option value="0-500000">0 - 500,000 VND</Option>
                <Option value="500000-1000000">500,000 - 1,000,000 VND</Option>
                <Option value="1000000-2000000">1,000,000 - 2,000,000 VND</Option>
                <Option value="2000000">Over 2,000,000 VND</Option>
              </Select>
            </Col>
            <Col xs={24} md={10}>
              <RangePicker
                style={{ width: '100%' }}
                onChange={(dates) => setDateRange(dates)}
                value={dateRange}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col xs={24} md={6}>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={resetFilters}
                style={{ width: '100%' }}
              >
                Refresh
              </Button>
            </Col>
          </Row>
        </Card>
        
        <div className="overflow-x-auto">
          <Table 
            columns={columns} 
            dataSource={data} 
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} buyers`
            }}
            className="shadow-md"
            scroll={{ x: 'max-content' }}
          />
        </div>
      </Card>
    </div>
  );
}