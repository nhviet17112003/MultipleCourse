import React, { useEffect, useState } from "react";
import { 
  Table, 
  Card, 
  Statistic, 
  Layout, 
  Typography, 
  Spin, 
  Divider,
  DatePicker,
  Select,
  Input,
  Button,
  Space,
  Row,
  Col
} from "antd";
import { 
  DollarOutlined, 
  CalendarOutlined, 
  LineChartOutlined,
  ShoppingCartOutlined,
  FilterOutlined,
  SearchOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const { Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const StatisticForAdmin = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);
  const [revenueYear, setRevenueYear] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [dateRange, setDateRange] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [priceRange, setPriceRange] = useState(null);
  const [sortField, setSortField] = useState('order_date');
  const [sortDirection, setSortDirection] = useState('descend');

  const fetchData = async (url, setState) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setState(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchData("http://localhost:3000/api/orders/revenue", (data) =>
          setTotalRevenue(data.totalRevenue)
        ),
        fetchData("http://localhost:3000/api/orders/revenue-day", (data) =>
          setRevenueToday(data.totalRevenueToday)
        ),
        fetchData("http://localhost:3000/api/orders/revenue-year", (data) =>
          setRevenueYear(data.totalRevenueThisYear)
        ),
        fetchData("http://localhost:3000/api/orders/revenue-each-month", setMonthlyRevenue),
        fetchData("http://localhost:3000/api/orders/all-orders", (data) => {
          setOrders(data);
          setFilteredOrders(data);
        })
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [dateRange, searchText, priceRange, orders, sortField, sortDirection]);

  const extractPriceValue = (priceString) => {
    if (!priceString) return 0;
    return parseInt(priceString.replace(/[^\d]/g, ''));
  };

  const applyFilters = () => {
    let result = [...orders];
    
    // Apply date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day').valueOf();
      const endDate = dateRange[1].endOf('day').valueOf();
      result = result.filter(order => {
        const orderDate = new Date(order.order_date).valueOf();
        return orderDate >= startDate && orderDate <= endDate;
      });
    }
    
    // Apply search filter (on buyer name)
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      result = result.filter(order => 
        (order.user?.fullname || "Anonymous").toLowerCase().includes(lowerSearchText)
      );
    }
    
    // Apply price range filter
    if (priceRange) {
      result = result.filter(order => {
        const price = order.total_price;
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'buyer':
          const nameA = (a.user?.fullname || "Anonymous").toLowerCase();
          const nameB = (b.user?.fullname || "Anonymous").toLowerCase();
          comparison = nameA.localeCompare(nameB);
          break;
        case 'total_price':
          comparison = a.total_price - b.total_price;
          break;
        case 'order_date':
        default:
          comparison = new Date(a.order_date) - new Date(b.order_date);
          break;
      }
      
      return sortDirection === 'ascend' ? comparison : -comparison;
    });
    
    setFilteredOrders(result);
  };

  const resetFilters = () => {
    setDateRange(null);
    setSearchText('');
    setPriceRange(null);
    setSortField('order_date');
    setSortDirection('descend');
    setFilteredOrders(orders);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Spin 
          size="large" 
          className="text-6xl"
          indicator={
            <LineChartOutlined 
              spin 
              className="text-blue-600 animate-pulse" 
            />
          } 
        />
      </div>
    );
  }

  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter) {
      setSortField(sorter.field);
      setSortDirection(sorter.order || 'descend');
    }
  };

  const columns = [
    {
      title: 'Buyer',
      dataIndex: 'buyer',
      key: 'buyer',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (text) => (
        <div className="flex items-center">
          <ShoppingCartOutlined className="mr-2 text-blue-500" />
          <span className="font-medium text-gray-800">{text}</span>
        </div>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (text) => (
        <div className="text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-md inline-block">
          {text}
        </div>
      )
    },
    {
      title: 'Order Date',
      dataIndex: 'order',
      key: 'order',
      sorter: true,
      defaultSortOrder: 'descend',
      sortDirections: ['ascend', 'descend'],
      render: (text) => (
        <div className="text-gray-600 bg-gray-50 px-2 py-1 rounded-md inline-block">
          {text}
        </div>
      )
    }
  ];

  const data = filteredOrders.map((order) => ({
    key: order._id,
    buyer: order.user?.fullname || "Anonymous",
    amount: `${order.total_price} VND`,
    order: new Date(order.order_date).toLocaleDateString(),
    rawData: order // keeping the raw data for sorting
  }));

  // Price range options for select
  const priceRangeOptions = [
    { label: 'All Prices', value: null },
    { label: 'Under 100,000 VND', value: [0, 100000] },
    { label: '100,000 - 500,000 VND', value: [100000, 500000] },
    { label: '500,000 - 1,000,000 VND', value: [500000, 1000000] },
    { label: 'Over 1,000,000 VND', value: [1000000, Infinity] }
  ];

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Content className="max-w-7xl mx-auto w-full">
        <div className="mb-8 flex justify-between items-center">
          <Title 
            level={2} 
            className="text-gray-800 flex items-center gap-3 m-0"
          >
            <LineChartOutlined className="text-blue-600" />
            Revenue Dashboard
          </Title>
          <div className="flex items-center space-x-2">
            <Text type="secondary" className="text-sm">
              Last Updated: {new Date().toLocaleString()}
            </Text>
          </div>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="shadow-lg rounded-2xl transform transition-all hover:-translate-y-2 hover:shadow-xl"
            bordered={false}
            style={{ 
              background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
              color: 'white'
            }}
          >
            <Statistic
              title={<span className="text-white opacity-80">Total Revenue</span>}
              value={totalRevenue}
              prefix={<DollarOutlined className="text-white" />}
              suffix="VND"
              valueStyle={{ color: 'white', fontSize: '1.5rem' }}
            />
          </Card>
          <Card 
            className="shadow-lg rounded-2xl transform transition-all hover:-translate-y-2 hover:shadow-xl"
            bordered={false}
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <Statistic
              title={<span className="text-white opacity-80">Today's Revenue</span>}
              value={revenueToday}
              prefix={<CalendarOutlined className="text-white" />}
              suffix="VND"
              valueStyle={{ color: 'white', fontSize: '1.5rem' }}
            />
          </Card>
          <Card 
            className="shadow-lg rounded-2xl transform transition-all hover:-translate-y-2 hover:shadow-xl"
            bordered={false}
            style={{ 
              background: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
              color: 'white'
            }}
          >
            <Statistic
              title={<span className="text-white opacity-80">Yearly Revenue</span>}
              value={revenueYear}
              prefix={<DollarOutlined className="text-white" />}
              suffix="VND"
              valueStyle={{ color: 'white', fontSize: '1.5rem' }}
            />
          </Card>
        </div>

        {/* Monthly Revenue Chart */}
        <Card 
          title="Monthly Revenue Trend" 
          className="mb-8 shadow-lg rounded-2xl overflow-hidden"
          headStyle={{ 
            backgroundColor: '#f8fafc', 
            borderBottom: '1px solid #e2e8f0',
            fontWeight: 600,
            color: '#2d3748'
          }}
        >
          <div className="h-[400px] bg-white">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={monthlyRevenue}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke="#f0f0f0"
                />
                <XAxis 
                  dataKey="month" 
                  stroke="#718096" 
                  tickLine={false}
                />
                <YAxis 
                  stroke="#718096" 
                  tickLine={false}
                  tickFormatter={(value) => `${value} VND`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#3182ce" 
                  barSize={50} 
                  radius={[10, 10, 0, 0]}
                  className="hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Order List with Filters */}
        <Card 
          title="Recent Orders" 
          className="shadow-lg rounded-2xl"
          headStyle={{ 
            backgroundColor: '#f8fafc', 
            borderBottom: '1px solid #e2e8f0',
            fontWeight: 600,
            color: '#2d3748'
          }}
          extra={
            <div className="flex items-center">
              <Text type="secondary" className="mr-2">
                {filteredOrders.length} of {orders.length} orders
              </Text>
            </div>
          }
        >
          {/* Filter Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center mb-3">
              <FilterOutlined className="mr-2 text-blue-600" />
              <Text strong>Filter Orders</Text>
            </div>
            
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} md={8}>
                <div className="mb-2">
                  <Text type="secondary">Date Range</Text>
                </div>
                <RangePicker 
                  style={{ width: '100%' }}
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates)}
                  placeholder={['Start Date', 'End Date']}
                />
              </Col>
              
              <Col xs={24} md={8}>
                <div className="mb-2">
                  <Text type="secondary">Search by Buyer</Text>
                </div>
                <Input 
                  placeholder="Search buyer name" 
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  prefix={<SearchOutlined className="text-gray-400" />}
                  allowClear
                />
              </Col>
              
              <Col xs={24} md={8}>
                <div className="mb-2">
                  <Text type="secondary">Price Range</Text>
                </div>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select price range"
                  value={priceRange}
                  onChange={(value) => setPriceRange(value)}
                  allowClear
                >
                  {priceRangeOptions.map((option, index) => (
                    <Option key={index} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
            
            <div className="flex justify-end">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={resetFilters}
                className="bg-gray-200 hover:bg-gray-300 border-none shadow-sm"
              >
                Reset Filters
              </Button>
            </div>
          </div>
          
          <Table 
            columns={columns} 
            dataSource={data} 
            pagination={{ 
              pageSize: 5, 
              showSizeChanger: true,
              style: { marginTop: '16px' },
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} orders`
            }}
            className="w-full"
            scroll={{ x: 600 }}
            onChange={handleTableChange}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default StatisticForAdmin;