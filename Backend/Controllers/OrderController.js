const Order = require("../Models/Orders");
const Course = require("../Models/Courses");
const User = require("../Models/Users");
const Wallet = require("../Models/Wallet");
const Cart = require("../Models/Cart");

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const cart_id = req.params.cart_id;
    const cart = await Cart.findById(cart_id);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const student = await User.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const studentWallet = await Wallet.findOne({ user: student._id });
    if (!studentWallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (studentWallet.current_balance < cart.total_price) {
      return res.status(400).json({ message: "Not enough balance" });
    }

    const order_items = cart.cart_items;
    const total_price = cart.total_price;

    for (let order_item of order_items) {
      const course = await Course.findById(order_item.course);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      const tutorWallet = await Wallet.findOne({ user: course.tutor });
      if (!tutorWallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      tutorWallet.total_earning += course.price;
      tutorWallet.current_balance += course.price;
      await tutorWallet.save();
    }

    studentWallet.current_balance -= total_price;
    studentWallet.total_spend += total_price;

    const newOrder = new Order({
      user: student._id,
      order_items,
      total_price,
    });

    await newOrder.save();
    await studentWallet.save();
    res.status(201).json("Order created successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("order_items.course")
      .populate("user", "fullname email");
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Revenue for Admin
exports.getRevenueForAdmin = async (req, res) => {
  try {
    const orders = await Order.find();
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.total_price,
      0
    );
    res.status(200).json({ totalRevenue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Revenue by Month
exports.getRevenueEachMonthForAdmin = async (req, res) => {
  try {
    const orders = await Order.find();
    const revenue = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthlyRevenue = orders.reduce((sum, order) => {
        const orderMonth = order.order_date.getMonth() + 1;
        return orderMonth === month ? sum + order.total_price : sum;
      }, 0);
      return { month, revenue: monthlyRevenue };
    });

    res.status(200).json(revenue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Revenue for Today
exports.getRevenueForToday = async (req, res) => {
  try {
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const orders = await Order.find({ order_date: { $gte: startOfToday } });
    const totalRevenueToday = orders.reduce(
      (sum, order) => sum + order.total_price,
      0
    );

    res.status(200).json({ totalRevenueToday });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Revenue for This Year
exports.getRevenueForThisYear = async (req, res) => {
  try {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const orders = await Order.find({ order_date: { $gte: startOfYear } });
    const totalRevenueThisYear = orders.reduce(
      (sum, order) => sum + order.total_price,
      0
    );

    res.status(200).json({ totalRevenueThisYear });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get My Orders (User)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate(
      "order_items.course"
    );
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Sold Count for a Specific Course
exports.getCourseSalesCountById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.course_id);

    // Kiểm tra nếu không tìm thấy khóa học
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Tìm tất cả đơn hàng có chứa khóa học này
    const orders = await Order.find({ "order_items.course": course._id });

    // Đếm số lần khóa học này xuất hiện trong tất cả các đơn hàng
    const soldCount = orders.reduce((count, order) => {
      return (
        count +
        order.order_items.filter(
          (item) => item.course.toString() === course._id.toString()
        ).length
      );
    }, 0);

    res.status(200).json({ course_id: course._id, soldCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
