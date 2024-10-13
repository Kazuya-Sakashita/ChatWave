class Friend < ApplicationRecord
  belongs_to :user
  belongs_to :friend, class_name: 'User'

  include AASM

  aasm column: 'state' do
    state :pending, initial: true
    state :accepted
    state :rejected
    state :blocked

    event :accept do
      transitions from: :pending, to: :accepted
      after do
        self.update(accepted_at: Time.current)
      end
    end

    event :reject do
      transitions from: :pending, to: :rejected
      after do
        self.update(rejected_at: Time.current)
      end
    end

    event :block do
      transitions from: [:pending, :accepted], to: :blocked
      after do
        self.update(blocked_at: Time.current)
      end
    end
  end
end
