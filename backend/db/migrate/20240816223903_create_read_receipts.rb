class CreateReadReceipts < ActiveRecord::Migration[7.0]
  def change
    create_table :read_receipts do |t|
      t.references :user, null: false, foreign_key: true
      t.references :read_receiptable, polymorphic: true, null: false

      t.timestamps
    end

    add_index :read_receipts, [:user_id, :read_receiptable_type, :read_receiptable_id], unique: true, name: 'index_read_receipts_on_user_and_read_receiptable'
  end
end
