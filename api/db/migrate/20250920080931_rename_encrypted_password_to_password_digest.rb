class RenameEncryptedPasswordToPasswordDigest < ActiveRecord::Migration[8.0]
  def change
    rename_column :user_credentials, :encrypted_password, :password_digest
  end
end
