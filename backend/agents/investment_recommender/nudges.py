# nudges.py

import datetime

class UserGamification:
    def __init__(self, user_id):
        self.user_id = user_id
        self.xp = 0
        self.level = 1
        self.streak = 0
        self.last_investment_date = None
        self.badges = []

    def add_investment(self, amount, date):
        """
        Call this every time user makes a micro-investment
        """
        self.xp += int(amount / 10)  # ₹100 = 10 XP
        self.last_investment_date = date

        # Check streak
        if self._is_continuous_week(date):
            self.streak += 1
        else:
            self.streak = 1  # reset

        # Award badges
        self._check_badges()

        # Update level
        self._update_level()

    def _is_continuous_week(self, date):
        if not self.last_investment_date:
            return False
        delta = (date - self.last_investment_date).days
        return 6 <= delta <= 8

    def _update_level(self):
        if self.xp >= 1000:
            self.level = 5
        elif self.xp >= 750:
            self.level = 4
        elif self.xp >= 500:
            self.level = 3
        elif self.xp >= 250:
            self.level = 2
        else:
            self.level = 1

    def _check_badges(self):
        if self.streak == 4 and "Streak Starter" not in self.badges:
            self.badges.append("Streak Starter")
        if self.xp >= 500 and "Halfway Hero" not in self.badges:
            self.badges.append("Halfway Hero")
        if self.streak == 8 and "Discipline Demon" not in self.badges:
            self.badges.append("Discipline Demon")

    def generate_nudge(self, today: datetime.date):
        """
        Returns a friendly nudge if user missed weekly invest
        """
        if not self.last_investment_date:
            return "👋 Ready to start your weekly ₹200 micro-investment?"
        
        days_since = (today - self.last_investment_date).days
        if days_since > 7:
            return f"⚠️ Missed your last week's goal. Try investing ₹200 today to stay on track!"

        return None

    def summary(self):
        return {
            "xp": self.xp,
            "level": self.level,
            "streak": self.streak,
            "badges": self.badges
        }
