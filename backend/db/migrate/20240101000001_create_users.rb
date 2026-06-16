class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    enable_extension 'pgcrypto' unless extension_enabled?('pgcrypto')

    create_table :users, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.string  :email,                   null: false
      t.string  :name,                    null: false
      t.string  :password_digest
      t.string  :avatar_url
      t.string  :provider,               default: 'local', null: false
      t.string  :preferred_language,     default: 'en',    null: false
      t.string  :ui_language,            default: 'en',    null: false
      t.integer :preferred_reading_time, default: 5,       null: false
      t.string  :theme,                  default: 'system', null: false

      t.timestamps null: false
    end

    add_index :users, :email, unique: true
  end
end
