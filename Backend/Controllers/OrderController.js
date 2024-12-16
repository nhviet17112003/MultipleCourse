const Order = require("../Models/Orders");
const Course = require("../Models/Courses");
const User = require("../Models/Users");

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const user = await User.findById(req.user._id);
    const price = course.price;
    const newOrder = new Order({
      user: user._id,
      course: course._id,
      price: price,
    });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
//----------------(for admin)----------------
// Get All Orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get all revenue for admin
exports.getRevenueForAdmin = async (req, res) => {
  try {
    const orders = await Order.find();
    let totalRevenue = 0;
    orders.forEach((order) => {
      totalRevenue += order.price;
    });
    res.status(200).json({ totalRevenue });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Đây là api để tính doanh thu từng tháng từ 1 - 12 trong năm cho admin
exports.getRevenueEachMonthForAdmin = async (req, res) => {
  try {
    const orders = await Order.find();
    console.log("Orders:", orders); // Log orders to verify the data

    let revenue = [];
    for (let i = 1; i <= 12; i++) {
      let totalRevenue = 0;
      orders.forEach((order) => {
        if (order.order_date) {
          const orderMonth = order.order_date.getMonth() + 1;
          if (orderMonth === i) {
            totalRevenue += order.price;
          }
        }
      });
      revenue.push({ month: i, revenue: totalRevenue });
    }
    console.log("Revenue:", revenue); // Log the final revenue
    res.status(200).json(revenue);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Api tính doanh thu trong ngày hôm nay cho admin
exports.getRevenueForToday = async (req, res) => {
  try {
    const orders = await Order.find();
    console.log("Orders:", orders); // Log orders to verify the data

    // Get today's date
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0)); // Set the time to 00:00:00 for today's start

    let totalRevenueToday = 0;

    orders.forEach((order) => {
      if (order.order_date) {
        const orderDate = new Date(order.order_date);
        // Check if the order was placed today
        if (orderDate.toDateString() === startOfToday.toDateString()) {
          totalRevenueToday += order.price;
        }
      }
    });

    console.log("Revenue for Today:", totalRevenueToday); // Log the final revenue for today
    res.status(200).json({ totalRevenueToday });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Api tính doanh thu năm hiện tại  cho admin
exports.getRevenueForThisYear = async (req, res) => {
  try {
    const orders = await Order.find();
    console.log("Orders:", orders); // Log orders to verify the data

    // Get current year
    const today = new Date();
    const currentYear = today.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1); // Jan 1st of current year

    let totalRevenueThisYear = 0;

    orders.forEach((order) => {
      if (order.order_date) {
        const orderDate = new Date(order.order_date);
        // Check if the order was placed this year
        if (orderDate >= startOfYear && orderDate <= today) {
          totalRevenueThisYear += order.price;
        }
      }
    });

    console.log("Revenue for This Year:", totalRevenueThisYear); // Log the final revenue for the year
    res.status(200).json({ totalRevenueThisYear });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//----------------(for admin)----------------

//----------------(For user)----------------
// Get My Orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
