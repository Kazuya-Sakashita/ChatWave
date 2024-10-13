class AddStatusTimestampsToFriends < ActiveRecord::Migration[7.0]
  def change
    add_column :friends, :state, :string, default: 'pending'
    add_column :friends, :accepted_at, :datetime
    add_column :friends, :rejected_at, :datetime
    add_column :friends, :blocked_at, :datetime
  end
end
