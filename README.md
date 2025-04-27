# **CFG Derivation Game**

## **Table of Contents**

- [Description](#description)
- [Objective](#objective)
- [Features](#features)
- [How to Play](#how-to-play)
- [Screenshots](#screenshots)
- [Technologies Used](#technologies-used)
- [Contributors](#contributors)

---

## **Description**

The **CFG Derivation Game** is an interactive web-based game designed to help users understand and practice Context-Free Grammar (CFG) derivations. The game challenges players to generate a target string using CFG production rules within a limited depth and time. It combines learning with fun, offering a visually engaging experience with derivation trees and dynamic gameplay.

---

## **Objective**

The goal of the game is to:

- Generate the target string using the provided CFG production rules.
- Complete the derivation within the specified tree depth and time limit.
- Enhance understanding of CFGs and derivation processes in a fun and interactive way.

---

## **Features**

- **Dynamic Derivation Tree**: Visualize the derivation process as a vertical tree structure.
- **Customizable Rules**: Input your own CFG production rules and target string.
- **Time and Depth Constraints**: Test your skills under pressure with a timer and depth limit.
- **Interactive Gameplay**: Select non-terminals, positions, and rules to progress through the derivation.
- **Win/Lose Screens**: Get feedback on your performance with visually appealing win/lose screens.
- **Responsive Design**: Play the game seamlessly on any device.

---

## **How to Play**

1. **Setup the Game**:

   - Input CFG production rules in the format `A → a | b | c`.
   - Specify the target string you want to derive.
   - Set the maximum tree depth for the derivation process.
2. **Start the Game**:

   - The game begins with the start symbol (`S`) as the initial string.
   - Use the provided rules to replace non-terminals and derive the target string.
3. **Make Your Moves**:

   - Select a non-terminal from the current string.
   - Choose its position and apply a production rule to replace it.
4. **Win or Lose**:

   - Win by deriving the target string within the time and depth limits.
   - Lose if you exceed the maximum depth or run out of time.

---

## **Screenshots**

### **Main Screen**

![Main Screen](https://github.com/abdullahazharkhan/CFG-Derivation-Game/blob/main/public/Main%20Screen.png)

### **Game Setup**

![Game Setup](https://github.com/abdullahazharkhan/CFG-Derivation-Game/blob/main/public/Game%20Setup.png)

### **Gameplay**

![Gameplay](https://github.com/abdullahazharkhan/CFG-Derivation-Game/blob/main/public/Game%20Play.png)

### **Derivation Tree**

![Derivation Tree](https://github.com/abdullahazharkhan/CFG-Derivation-Game/blob/main/public/Derivation%20Tree.png)

### **Win/Lose Screen**

![Win Screen](https://github.com/abdullahazharkhan/CFG-Derivation-Game/blob/main/public/Win%20Screen.png)

---

## **Technologies Used**

- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Routing**: React Router

---

## **Contributors**

- **[Abdul Rafay Mughal](https://github.com/abdul-rafay-mughal)**
- **[Abdullah Azhar Khan](https://github.com/abdullahazharkhan)**
- **[Muhammad Awais Shaikh](https://github.com/codexbegin14)**

Feel free to contribute or suggest improvements to the project!

---

## **Future Enhancements**

- Add support for saving and loading custom CFGs.
- Implement a leaderboard to track high scores.
- Add hints and tutorials for beginners.
- Enhance the derivation tree with animations.

---

PS: UI might not be very good, considering it was made solely for 5 weightage =].
