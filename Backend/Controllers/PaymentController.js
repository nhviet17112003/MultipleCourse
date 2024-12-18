const Payment = require("../Models/Payment.js");
const Wallet = require("../Models/Wallet");
const Order = require("../Models/Orders");
const Cart = require("../Models/Cart");
const Course = require("../Models/Courses");
const PayOS = require("../Configurations/PayOS");

exports.createPayment = async (req, res) => {
  try {
    const user_id = req.user._id;
    const cart_id = req.params.cart_id;
    const cart = await Cart.findById(cart_id);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const order = await Order.create({
      user: user_id,
      total_price: cart.total_price,
      status: "Pending",
      order_items: cart.cart_items,
    });

    const orderCode = Date.now();
    const payment_description = `Payment for order ${orderCode}`;
    const newPayment = await Payment.create({
      order_code: orderCode,
      user: user_id,
      order: order._id,
      payment_status: "Pending",
      description: payment_description,
      payment_amount: order.total_price,
    });

    const body = {
      orderCode: orderCode,
      amount: newPayment.payment_amount,
      description: orderCode,
      cancelUrl: `http://localhost:3000/api/payment/check-payment/${orderCode}`,
      returnUrl: `http://localhost:3000/api/payment/check-payment/${orderCode}`,
      // cancelUrl: `http://localhost:3001/cancel?orderCode=${orderCode}&status=CANCELLED`,
      // returnUrl: `http://localhost:3001/success?orderCode=${orderCode}&status=SUCCESS`,
    };

    const paymentLinkRes = await PayOS.createPaymentLink(body);

    res.status(200).end(paymentLinkRes.checkoutUrl);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.checkPayment = async (req, res) => {
  try {
    const orderCode = req.params.orderCode;
    const status = req.query.status;
    const payment = await Payment.findOne({
      order_code: orderCode,
    });
    if (payment.payment_status !== "Pending") {
      return res.status(400).json({ message: "Payment already processed" });
    }

    if (status === "PAID") {
      payment.payment_status = "Paid";
      await payment.save();

      const order = await Order.findById(payment.order);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      order.status = "Success";
      await order.save();

      const orderItems = order.order_items;
      const updatedWallets = new Set();

      for (item of orderItems) {
        // Update wallet
        const courseId = item.course;
        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }
        // Check if wallet has already been updated for tutor of course
        const tutorId = course.tutor;
        if (updatedWallets.has(tutorId)) {
          continue;
        } else {
          // Check if wallet exists for tutor of course
          const wallet = await Wallet.findOne({ tutor: tutorId });
          if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
          }
          // Update wallet balance
          wallet.total_earning += course.price;
          wallet.current_balance += course.price;
          await wallet.save();
          console.log(wallet);

          updatedWallets.add(tutorId);
        }
      }
      await Cart.findOneAndDelete({ user: order.user });

      res.status(200).json({ message: "Payment successful" });
    }
    if (status === "CANCELLED") {
      payment.payment_status = "Cancelled";
      await payment.save();
      const order = await Order.findById(payment.order);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      order.status = "Failed";
      await order.save();
      res.status(200).json({ message: "Payment cancelled" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
